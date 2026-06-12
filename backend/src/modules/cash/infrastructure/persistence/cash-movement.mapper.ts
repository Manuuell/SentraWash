import { CashMovement } from '../../domain/cash-movement';
import { CashMovementOrmEntity } from './cash-movement.orm-entity';

export class CashMovementMapper {
  static toDomain(o: CashMovementOrmEntity): CashMovement {
    return CashMovement.rehydrate({
      id: o.id,
      tenantId: o.tenantId,
      cashSessionId: o.cashSessionId,
      tipo: o.tipo,
      concepto: o.concepto,
      monto: Number(o.monto),
      workOrderId: o.workOrderId ?? null,
      paymentId: o.paymentId ?? null,
      registradoPor: o.registradoPor ?? null,
      createdAt: o.createdAt,
    });
  }

  static toOrm(movement: CashMovement): CashMovementOrmEntity {
    const p = movement.toPrimitives();
    const o = new CashMovementOrmEntity();
    if (p.id) o.id = p.id;
    o.tenantId = p.tenantId;
    o.cashSessionId = p.cashSessionId;
    o.tipo = p.tipo;
    o.concepto = p.concepto;
    o.monto = p.monto.toFixed(2);
    o.workOrderId = p.workOrderId;
    o.paymentId = p.paymentId;
    o.registradoPor = p.registradoPor;
    return o;
  }
}
