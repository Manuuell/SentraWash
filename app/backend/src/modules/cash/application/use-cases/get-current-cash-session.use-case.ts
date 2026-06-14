import { Inject, Injectable } from '@nestjs/common';
import { ok, Result } from '../../../../core/common/result';
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
export class GetCurrentCashSessionUseCase {
  constructor(
    @Inject(CASH_SESSION_REPOSITORY) private readonly sessions: CashSessionRepository,
    @Inject(CASH_MOVEMENT_REPOSITORY) private readonly movements: CashMovementRepository,
  ) {}

  async execute(): Promise<Result<CashSessionDetail | null>> {
    const session = await this.sessions.findOpen();
    if (!session) {
      return ok(null);
    }
    const movements = await this.movements.findBySession(session.id);
    return ok({ session, movements });
  }
}
