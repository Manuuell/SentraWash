import { Inject, Injectable } from '@nestjs/common';
import { ok, Result } from '../../../../core/common/result';
import { Payment } from '../../domain/payment';
import { PAYMENT_REPOSITORY, PaymentRepository } from '../../domain/payment.repository';

@Injectable()
export class ListPaymentsUseCase {
  constructor(
    @Inject(PAYMENT_REPOSITORY) private readonly payments: PaymentRepository,
  ) {}

  /** Lista todos los pagos, o los de una orden si se indica workOrderId. */
  async execute(workOrderId?: string): Promise<Result<Payment[]>> {
    if (workOrderId) {
      return ok(await this.payments.findByWorkOrder(workOrderId));
    }
    return ok(await this.payments.findAll());
  }
}
