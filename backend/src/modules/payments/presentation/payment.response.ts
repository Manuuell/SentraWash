import { Payment } from '../domain/payment';

export class PaymentResponse {
  id!: string;
  workOrderId!: string | null;
  cashSessionId!: string | null;
  metodo!: string;
  monto!: number;
  estado!: string;
  referencia!: string | null;
  registradoPor!: string | null;
  fechaPago!: Date;

  static from(payment: Payment): PaymentResponse {
    const p = payment.toPrimitives();
    return {
      id: p.id,
      workOrderId: p.workOrderId,
      cashSessionId: p.cashSessionId,
      metodo: p.metodo,
      monto: p.monto,
      estado: p.estado,
      referencia: p.referencia,
      registradoPor: p.registradoPor,
      fechaPago: p.fechaPago,
    };
  }
}
