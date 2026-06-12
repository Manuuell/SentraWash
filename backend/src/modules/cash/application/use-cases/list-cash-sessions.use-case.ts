import { Inject, Injectable } from '@nestjs/common';
import { ok, Result } from '../../../../core/common/result';
import { CashSession } from '../../domain/cash-session';
import {
  CASH_SESSION_REPOSITORY,
  CashSessionRepository,
} from '../../domain/cash-session.repository';

@Injectable()
export class ListCashSessionsUseCase {
  constructor(
    @Inject(CASH_SESSION_REPOSITORY) private readonly sessions: CashSessionRepository,
  ) {}

  async execute(): Promise<Result<CashSession[]>> {
    return ok(await this.sessions.findAll());
  }
}
