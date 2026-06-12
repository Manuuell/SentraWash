import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { TenantStore, tenantStorage } from './tenant-context';

/**
 * Ejecuta una función dentro del contexto de un tenant: abre una transacción,
 * fija `app.current_tenant` (RLS) y corre el callback en el AsyncLocalStorage.
 *
 * Lo usan los procesos que NO pasan por el interceptor HTTP (webhooks, workers,
 * tareas programadas), donde el tenant se resuelve por otros medios.
 */
@Injectable()
export class TenantScopeRunner {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async run<T>(tenantId: string, fn: () => Promise<T>): Promise<T> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    await queryRunner.query('SELECT set_config($1, $2, true)', ['app.current_tenant', tenantId]);

    const store: TenantStore = { tenantId, manager: queryRunner.manager };
    try {
      const result = await tenantStorage.run(store, fn);
      await queryRunner.commitTransaction();
      return result;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
