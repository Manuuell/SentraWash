import { Inject, Injectable } from '@nestjs/common';
import { DomainError, NotFoundError } from '../../../../core/common/domain-error';
import { err, ok, Result } from '../../../../core/common/result';
import { UseCase } from '../../../../core/common/use-case';
import { Payment } from '../../domain/payment';
import { PAYMENT_REPOSITORY, PaymentRepository } from '../../domain/payment.repository';

/**
 * Anula un pago. Nota: la reversión del movimiento de caja asociado (si fue en
 * efectivo) se implementará al endurecer la conciliación de caja.
 */
@Injectable()
export class VoidPaymentUseCase implements UseCase<string, Payment> {
  constructor(
    @Inject(PAYMENT_REPOSITORY) private readonly payments: PaymentRepository,
  ) {}

  async execute(id: string): Promise<Result<Payment>> {
    const payment = await this.payments.findById(id);
    if (!payment) {
      return err(new NotFoundError(`Pago ${id} no encontrado`));
    }
    try {
      payment.anular();
    } catch (error) {
      if (error instanceof DomainError) return err(error);
      throw error;
    }
    return ok(await this.payments.save(payment));
  }
}
