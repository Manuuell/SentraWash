import {
  CallHandler,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { Observable } from 'rxjs';
import { DataSource, QueryRunner } from 'typeorm';
import { Request } from 'express';
import { TenancyConfig } from '../config/configuration';
import { AuthenticatedUser } from '../auth/authenticated-user';
import { SKIP_TENANT_KEY } from './skip-tenant.decorator';
import { TenantStore, tenantStorage } from './tenant-context';

/**
 * Por cada petición tenant-scoped:
 *   1. Resuelve el tenantId (JWT en prod, header en dev).
 *   2. Abre una transacción y fija `app.current_tenant` con SET LOCAL.
 *   3. Ejecuta el handler dentro del AsyncLocalStorage con ese EntityManager.
 *   4. Commit al completar / rollback ante error; siempre libera la conexión.
 *
 * Resultado: las políticas RLS de PostgreSQL aíslan los datos por tenant a
 * nivel del motor. Si no hay tenant, se deniega (fail-closed).
 */
@Injectable()
export class TenantTransactionInterceptor implements NestInterceptor {
  constructor(
    private readonly dataSource: DataSource,
    private readonly reflector: Reflector,
    private readonly configService: ConfigService,
  ) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<unknown>> {
    const skip = this.reflector.getAllAndOverride<boolean>(SKIP_TENANT_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (skip) {
      return next.handle();
    }

    const req = context.switchToHttp().getRequest<Request & { user?: AuthenticatedUser }>();
    const tenantId = this.resolveTenantId(req);
    if (!tenantId) {
      throw new ForbiddenException('No se pudo resolver el tenant de la petición');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    // set_config(name, value, is_local=true) === SET LOCAL: ámbito de la transacción.
    await queryRunner.query('SELECT set_config($1, $2, true)', ['app.current_tenant', tenantId]);

    const store: TenantStore = { tenantId, manager: queryRunner.manager };

    return new Observable((subscriber) => {
      tenantStorage.run(store, () => {
        next.handle().subscribe({
          next: (value) => subscriber.next(value),
          error: (error) => {
            void this.rollback(queryRunner).finally(() => subscriber.error(error));
          },
          complete: () => {
            void this.commit(queryRunner).then(
              () => subscriber.complete(),
              (error) => subscriber.error(error),
            );
          },
        });
      });
    });
  }

  private resolveTenantId(req: Request & { user?: AuthenticatedUser }): string | undefined {
    if (req.user?.tenantId) {
      return req.user.tenantId;
    }
    const tenancy = this.configService.get<TenancyConfig>('tenancy');
    if (tenancy?.allowHeaderTenant) {
      const fromHeader = req.headers[tenancy.header];
      if (typeof fromHeader === 'string' && fromHeader.length > 0) {
        return fromHeader;
      }
    }
    return undefined;
  }

  private async commit(queryRunner: QueryRunner): Promise<void> {
    try {
      await queryRunner.commitTransaction();
    } finally {
      await queryRunner.release();
    }
  }

  private async rollback(queryRunner: QueryRunner): Promise<void> {
    try {
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }
}
