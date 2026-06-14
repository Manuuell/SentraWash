import { ValidationError } from '../../../core/common/domain-error';
import { PaymentMethod } from './payment-method';
import { PaymentStatus } from './payment-status';

export interface PaymentProps {
  id: string;
  tenantId: string;
  workOrderId: string | null;
  cashSessionId: string | null;
  metodo: PaymentMethod;
  monto: number;
  estado: PaymentStatus;
  referencia: string | null;
  registradoPor: string | null;
  fechaPago: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface NewPayment {
  workOrderId: string | null;
  metodo: PaymentMethod;
  monto: number;
  referencia?: string | null;
  registradoPor?: string | null;
}

/** Pago de una orden. Se registra como PAGADO; puede anularse. */
export class Payment {
  private constructor(private props: PaymentProps) {}

  static rehydrate(props: PaymentProps): Payment {
    return new Payment(props);
  }

  static create(tenantId: string, input: NewPayment): Payment {
    if (input.monto <= 0) {
      throw new ValidationError('El monto del pago debe ser mayor a 0');
    }
    const now = new Date();
    return new Payment({
      id: '',
      tenantId,
      workOrderId: input.workOrderId ?? null,
      cashSessionId: null,
      metodo: input.metodo,
      monto: input.monto,
      estado: PaymentStatus.PAGADO,
      referencia: input.referencia?.trim() || null,
      registradoPor: input.registradoPor ?? null,
      fechaPago: now,
      createdAt: now,
      updatedAt: now,
    });
  }

  /** Asocia el pago a la sesión de caja donde impactó (efectivo). */
  linkToCashSession(cashSessionId: string): void {
    this.props.cashSessionId = cashSessionId;
    this.props.updatedAt = new Date();
  }

  anular(): void {
    if (this.props.estado === PaymentStatus.ANULADO) {
      throw new ValidationError('El pago ya está anulado');
    }
    this.props.estado = PaymentStatus.ANULADO;
    this.props.updatedAt = new Date();
  }

  toPrimitives(): PaymentProps {
    return { ...this.props };
  }

  get id(): string {
    return this.props.id;
  }

  get metodo(): PaymentMethod {
    return this.props.metodo;
  }
}
