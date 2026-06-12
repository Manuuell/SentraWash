import { Inject, Injectable } from '@nestjs/common';
import { ConflictError, DomainError } from '../../../../core/common/domain-error';
import { err, ok, Result } from '../../../../core/common/result';
import { UseCase } from '../../../../core/common/use-case';
import { TenantManager } from '../../../../core/tenancy/tenant-manager.service';
import { CashSession } from '../../domain/cash-session';
import {
  CASH_SESSION_REPOSITORY,
  CashSessionRepository,
} from '../../domain/cash-session.repository';
import { OpenCashSessionDto } from '../dto/open-cash-session.dto';

@Injectable()
export class OpenCashSessionUseCase implements UseCase<OpenCashSessionDto, CashSession> {
  constructor(
    @Inject(CASH_SESSION_REPOSITORY) private readonly sessions: CashSessionRepository,
    private readonly tenant: TenantManager,
  ) {}

  async execute(input: OpenCashSessionDto): Promise<Result<CashSession>> {
    const open = await this.sessions.findOpen();
    if (open) {
      return err(new ConflictError('Ya existe una caja abierta; ciérrala antes de abrir otra'));
    }
    let session: CashSession;
    try {
      session = CashSession.open(this.tenant.tenantId, {
        baseInicial: input.baseInicial,
        abiertaPor: input.abiertaPor ?? null,
      });
    } catch (error) {
      if (error instanceof DomainError) return err(error);
      throw error;
    }
    return ok(await this.sessions.save(session));
  }
}
