import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CASH_MOVEMENT_REPOSITORY } from './domain/cash-movement.repository';
import { CASH_SESSION_REPOSITORY } from './domain/cash-session.repository';
import { CloseCashSessionUseCase } from './application/use-cases/close-cash-session.use-case';
import { GetCashSessionUseCase } from './application/use-cases/get-cash-session.use-case';
import { GetCurrentCashSessionUseCase } from './application/use-cases/get-current-cash-session.use-case';
import { ListCashSessionsUseCase } from './application/use-cases/list-cash-sessions.use-case';
import { OpenCashSessionUseCase } from './application/use-cases/open-cash-session.use-case';
import { RegisterCashMovementUseCase } from './application/use-cases/register-cash-movement.use-case';
import { TypeormCashMovementRepository } from './infrastructure/persistence/typeorm-cash-movement.repository';
import { TypeormCashSessionRepository } from './infrastructure/persistence/typeorm-cash-session.repository';
import { CashMovementOrmEntity } from './infrastructure/persistence/cash-movement.orm-entity';
import { CashSessionOrmEntity } from './infrastructure/persistence/cash-session.orm-entity';
import { CashController } from './presentation/cash.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CashSessionOrmEntity, CashMovementOrmEntity])],
  controllers: [CashController],
  providers: [
    OpenCashSessionUseCase,
    CloseCashSessionUseCase,
    RegisterCashMovementUseCase,
    GetCurrentCashSessionUseCase,
    GetCashSessionUseCase,
    ListCashSessionsUseCase,
    { provide: CASH_SESSION_REPOSITORY, useClass: TypeormCashSessionRepository },
    { provide: CASH_MOVEMENT_REPOSITORY, useClass: TypeormCashMovementRepository },
  ],
  // Exporta los puertos para que el módulo de pagos registre movimientos de caja.
  exports: [CASH_SESSION_REPOSITORY, CASH_MOVEMENT_REPOSITORY],
})
export class CashModule {}
