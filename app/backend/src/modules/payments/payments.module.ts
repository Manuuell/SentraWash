import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CashModule } from '../cash/cash.module';
import { WorkOrdersModule } from '../work-orders/work-orders.module';
import { PAYMENT_REPOSITORY } from './domain/payment.repository';
import { GetPaymentUseCase } from './application/use-cases/get-payment.use-case';
import { ListPaymentsUseCase } from './application/use-cases/list-payments.use-case';
import { RegisterPaymentUseCase } from './application/use-cases/register-payment.use-case';
import { VoidPaymentUseCase } from './application/use-cases/void-payment.use-case';
import { TypeormPaymentRepository } from './infrastructure/persistence/typeorm-payment.repository';
import { PaymentOrmEntity } from './infrastructure/persistence/payment.orm-entity';
import { PaymentsController } from './presentation/payments.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([PaymentOrmEntity]),
    // Para validar la orden y para impactar la caja en pagos en efectivo.
    WorkOrdersModule,
    CashModule,
  ],
  controllers: [PaymentsController],
  providers: [
    RegisterPaymentUseCase,
    ListPaymentsUseCase,
    GetPaymentUseCase,
    VoidPaymentUseCase,
    { provide: PAYMENT_REPOSITORY, useClass: TypeormPaymentRepository },
  ],
})
export class PaymentsModule {}
