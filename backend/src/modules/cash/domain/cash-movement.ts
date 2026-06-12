import { ValidationError } from '../../../core/common/domain-error';
import { CashMovementType } from './cash-movement-type';

export interface CashMovementProps {
  id: string;
  tenantId: string;
  cashSessionId: string;
  tipo: CashMovementType;
  concepto: string;
  monto: number;
  workOrderId: string | null;
  paymentId: string | null;
  registradoPor: string | null;
  createdAt: Date;
}

export interface NewCashMovement {
  cashSessionId: string;
  tipo: CashMovementType;
  concepto: string;
  monto: number;
  workOrderId?: string | null;
  paymentId?: string | null;
  registradoPor?: string | null;
}

/** Movimiento de caja (ingreso/egreso) asociado a una sesión. */
export class CashMovement {
  private constructor(private props: CashMovementProps) {}

  static rehydrate(props: CashMovementProps): CashMovement {
    return new CashMovement(props);
  }

  static create(tenantId: string, input: NewCashMovement): CashMovement {
    if (!input.concepto?.trim()) {
      throw new ValidationError('El concepto del movimiento es obligatorio');
    }
    if (input.monto <= 0) {
      throw new ValidationError('El monto debe ser mayor a 0');
    }
    return new CashMovement({
      id: '',
      tenantId,
      cashSessionId: input.cashSessionId,
      tipo: input.tipo,
      concepto: input.concepto.trim(),
      monto: input.monto,
      workOrderId: input.workOrderId ?? null,
      paymentId: input.paymentId ?? null,
      registradoPor: input.registradoPor ?? null,
      createdAt: new Date(),
    });
  }

  toPrimitives(): CashMovementProps {
    return { ...this.props };
  }

  get id(): string {
    return this.props.id;
  }
}
