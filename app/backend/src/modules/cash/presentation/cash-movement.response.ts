import { CashMovement } from '../domain/cash-movement';

export class CashMovementResponse {
  id!: string;
  cashSessionId!: string;
  tipo!: string;
  concepto!: string;
  monto!: number;
  workOrderId!: string | null;
  paymentId!: string | null;
  registradoPor!: string | null;
  createdAt!: Date;

  static from(movement: CashMovement): CashMovementResponse {
    const p = movement.toPrimitives();
    return {
      id: p.id,
      cashSessionId: p.cashSessionId,
      tipo: p.tipo,
      concepto: p.concepto,
      monto: p.monto,
      workOrderId: p.workOrderId,
      paymentId: p.paymentId,
      registradoPor: p.registradoPor,
      createdAt: p.createdAt,
    };
  }
}
