import { Inject, Injectable } from '@nestjs/common';
import { DomainError, NotFoundError } from '../../../../core/common/domain-error';
import { err, ok, Result } from '../../../../core/common/result';
import { UseCase } from '../../../../core/common/use-case';
import { CashSession } from '../../domain/cash-session';
import {
  CASH_SESSION_REPOSITORY,
  CashSessionRepository,
} from '../../domain/cash-session.repository';
import { CloseCashSessionDto } from '../dto/close-cash-session.dto';

@Injectable()
export class CloseCashSessionUseCase implements UseCase<CloseCashSessionDto, CashSession> {
  constructor(
    @Inject(CASH_SESSION_REPOSITORY) private readonly sessions: CashSessionRepository,
  ) {}

  async execute(input: CloseCashSessionDto): Promise<Result<CashSession>> {
    const session = await this.sessions.findOpen();
    if (!session) {
      return err(new NotFoundError('No hay ninguna caja abierta para cerrar'));
    }
    try {
      session.close(input.saldoReal, input.cerradaPor ?? null);
    } catch (error) {
      if (error instanceof DomainError) return err(error);
      throw error;
    }
    return ok(await this.sessions.save(session));
  }
}
