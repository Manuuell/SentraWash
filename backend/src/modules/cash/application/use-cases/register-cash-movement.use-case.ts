import { Inject, Injectable } from '@nestjs/common';
import { DomainError, NotFoundError } from '../../../../core/common/domain-error';
import { err, ok, Result } from '../../../../core/common/result';
import { UseCase } from '../../../../core/common/use-case';
import { TenantManager } from '../../../../core/tenancy/tenant-manager.service';
import { CashMovement } from '../../domain/cash-movement';
import {
  CASH_MOVEMENT_REPOSITORY,
  CashMovementRepository,
} from '../../domain/cash-movement.repository';
import {
  CASH_SESSION_REPOSITORY,
  CashSessionRepository,
} from '../../domain/cash-session.repository';
import { RegisterCashMovementDto } from '../dto/register-cash-movement.dto';

@Injectable()
export class RegisterCashMovementUseCase implements UseCase<RegisterCashMovementDto, CashMovement> {
  constructor(
    @Inject(CASH_SESSION_REPOSITORY) private readonly sessions: CashSessionRepository,
    @Inject(CASH_MOVEMENT_REPOSITORY) private readonly movements: CashMovementRepository,
    private readonly tenant: TenantManager,
  ) {}

  async execute(input: RegisterCashMovementDto): Promise<Result<CashMovement>> {
    const session = await this.sessions.findOpen();
    if (!session) {
      return err(new NotFoundError('No hay ninguna caja abierta'));
    }
    let movement: CashMovement;
    try {
      movement = CashMovement.create(this.tenant.tenantId, {
        cashSessionId: session.id,
        tipo: input.tipo,
        concepto: input.concepto,
        monto: input.monto,
        workOrderId: input.workOrderId ?? null,
        paymentId: input.paymentId ?? null,
        registradoPor: input.registradoPor ?? null,
      });
      session.applyMovement(input.tipo, input.monto);
    } catch (error) {
      if (error instanceof DomainError) return err(error);
      throw error;
    }
    await this.sessions.save(session);
    return ok(await this.movements.save(movement));
  }
}
