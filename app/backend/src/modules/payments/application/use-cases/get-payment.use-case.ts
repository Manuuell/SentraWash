import { Inject, Injectable } from '@nestjs/common';
import { NotFoundError } from '../../../../core/common/domain-error';
import { err, ok, Result } from '../../../../core/common/result';
import { UseCase } from '../../../../core/common/use-case';
import { Payment } from '../../domain/payment';
import { PAYMENT_REPOSITORY, PaymentRepository } from '../../domain/payment.repository';

@Injectable()
export class GetPaymentUseCase implements UseCase<string, Payment> {
  constructor(
    @Inject(PAYMENT_REPOSITORY) private readonly payments: PaymentRepository,
  ) {}

  async execute(id: string): Promise<Result<Payment>> {
    const payment = await this.payments.findById(id);
    if (!payment) {
      return err(new NotFoundError(`Pago ${id} no encontrado`));
    }
    return ok(payment);
  }
}
