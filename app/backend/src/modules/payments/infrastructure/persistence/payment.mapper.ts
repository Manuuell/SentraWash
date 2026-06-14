import { Payment } from '../../domain/payment';
import { PaymentOrmEntity } from './payment.orm-entity';

export class PaymentMapper {
  static toDomain(o: PaymentOrmEntity): Payment {
    return Payment.rehydrate({
      id: o.id,
      tenantId: o.tenantId,
      workOrderId: o.workOrderId ?? null,
      cashSessionId: o.cashSessionId ?? null,
      metodo: o.metodo,
      monto: Number(o.monto),
      estado: o.estado,
      referencia: o.referencia ?? null,
      registradoPor: o.registradoPor ?? null,
      fechaPago: o.fechaPago,
      createdAt: o.createdAt,
      updatedAt: o.updatedAt,
    });
  }

  static toOrm(payment: Payment): PaymentOrmEntity {
    const p = payment.toPrimitives();
    const o = new PaymentOrmEntity();
    if (p.id) o.id = p.id;
    o.tenantId = p.tenantId;
    o.workOrderId = p.workOrderId;
    o.cashSessionId = p.cashSessionId;
    o.metodo = p.metodo;
    o.monto = p.monto.toFixed(2);
    o.estado = p.estado;
    o.referencia = p.referencia;
    o.registradoPor = p.registradoPor;
    o.fechaPago = p.fechaPago;
    return o;
  }
}
