import { Inject, Injectable } from '@nestjs/common';
import { NotFoundError } from '../../../../core/common/domain-error';
import { err, ok, Result } from '../../../../core/common/result';
import { UseCase } from '../../../../core/common/use-case';
import {
  CASH_MOVEMENT_REPOSITORY,
  CashMovementRepository,
} from '../../domain/cash-movement.repository';
import {
  CASH_SESSION_REPOSITORY,
  CashSessionRepository,
} from '../../domain/cash-session.repository';
import { CashSessionDetail } from '../cash-session-detail';

@Injectable()
export class GetCashSessionUseCase implements UseCase<string, CashSessionDetail> {
  constructor(
    @Inject(CASH_SESSION_REPOSITORY) private readonly sessions: CashSessionRepository,
    @Inject(CASH_MOVEMENT_REPOSITORY) private readonly movements: CashMovementRepository,
  ) {}

  async execute(id: string): Promise<Result<CashSessionDetail>> {
    const session = await this.sessions.findById(id);
    if (!session) {
      return err(new NotFoundError(`Sesión de caja ${id} no encontrada`));
    }
    const movements = await this.movements.findBySession(session.id);
    return ok({ session, movements });
  }
}
