import { Inject, Injectable } from '@nestjs/common';
import { DomainError, NotFoundError } from '../../../../core/common/domain-error';
import { err, ok, Result } from '../../../../core/common/result';
import { UseCase } from '../../../../core/common/use-case';
import { TenantManager } from '../../../../core/tenancy/tenant-manager.service';
import { CashMovement } from '../../../cash/domain/cash-movement';
import { CashMovementType } from '../../../cash/domain/cash-movement-type';
import {
  CASH_MOVEMENT_REPOSITORY,
  CashMovementRepository,
} from '../../../cash/domain/cash-movement.repository';
import {
  CASH_SESSION_REPOSITORY,
  CashSessionRepository,
} from '../../../cash/domain/cash-session.repository';
import {
  WORK_ORDER_REPOSITORY,
  WorkOrderRepository,
} from '../../../work-orders/domain/work-order.repository';
import { Payment } from '../../domain/payment';
import { PaymentMethod } from '../../domain/payment-method';
import { PAYMENT_REPOSITORY, PaymentRepository } from '../../domain/payment.repository';
import { RegisterPaymentDto } from '../dto/register-payment.dto';

/**
 * Registra un pago de una orden. Si es en EFECTIVO y hay una caja abierta, el
 * pago impacta la caja: se vincula a la sesión y se crea un movimiento de ingreso
 * (control de caja). Otros métodos (Nequi, tarjeta...) no tocan el efectivo físico.
 */
@Injectable()
export class RegisterPaymentUseCase implements UseCase<RegisterPaymentDto, Payment> {
  constructor(
    @Inject(PAYMENT_REPOSITORY) private readonly payments: PaymentRepository,
    @Inject(WORK_ORDER_REPOSITORY) private readonly orders: WorkOrderRepository,
    @Inject(CASH_SESSION_REPOSITORY) private readonly cashSessions: CashSessionRepository,
    @Inject(CASH_MOVEMENT_REPOSITORY) private readonly cashMovements: CashMovementRepository,
    private readonly tenant: TenantManager,
  ) {}

  async execute(input: RegisterPaymentDto): Promise<Result<Payment>> {
    const order = await this.orders.findById(input.workOrderId);
    if (!order) {
      return err(new NotFoundError(`Orden ${input.workOrderId} no encontrada`));
    }

    let payment: Payment;
    try {
      payment = Payment.create(this.tenant.tenantId, {
        workOrderId: input.workOrderId,
        metodo: input.metodo,
        monto: input.monto,
        referencia: input.referencia ?? null,
        registradoPor: input.registradoPor ?? null,
      });
    } catch (error) {
      if (error instanceof DomainError) return err(error);
      throw error;
    }

    if (input.metodo === PaymentMethod.EFECTIVO) {
      const session = await this.cashSessions.findOpen();
      if (session) {
        payment.linkToCashSession(session.id);
        const saved = await this.payments.save(payment);

        const movement = CashMovement.create(this.tenant.tenantId, {
          cashSessionId: session.id,
          tipo: CashMovementType.INGRESO,
          concepto: `Pago orden #${order.toPrimitives().numeroOrden}`,
          monto: input.monto,
          workOrderId: input.workOrderId,
          paymentId: saved.id,
          registradoPor: input.registradoPor ?? null,
        });
        session.applyMovement(CashMovementType.INGRESO, input.monto);
        await this.cashSessions.save(session);
        await this.cashMovements.save(movement);

        return ok(saved);
      }
    }

    return ok(await this.payments.save(payment));
  }
}
