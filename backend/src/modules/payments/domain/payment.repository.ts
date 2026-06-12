import { Payment } from './payment';

export interface PaymentRepository {
  findAll(): Promise<Payment[]>;
  findById(id: string): Promise<Payment | null>;
  findByWorkOrder(workOrderId: string): Promise<Payment[]>;
  save(payment: Payment): Promise<Payment>;
}

export const PAYMENT_REPOSITORY = Symbol('PAYMENT_REPOSITORY');
