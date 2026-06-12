import { NotificationEvent } from './notification-event';
import { NotificationStatus } from './notification-status';

export interface NotificationProps {
  id: string;
  tenantId: string;
  workOrderId: string | null;
  customerId: string | null;
  tipoEvento: NotificationEvent;
  template: string | null;
  estado: NotificationStatus;
  intentos: number;
  payload: Record<string, unknown>;
  scheduledAt: Date | null;
  sentAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface NewNotification {
  workOrderId: string | null;
  customerId: string | null;
  tipoEvento: NotificationEvent;
  payload: Record<string, unknown>;
  template?: string | null;
}

/** Notificación a un cliente (hoy por WhatsApp). La fila actúa como "cola". */
export class Notification {
  private constructor(private props: NotificationProps) {}

  static rehydrate(props: NotificationProps): Notification {
    return new Notification(props);
  }

  static create(tenantId: string, input: NewNotification): Notification {
    const now = new Date();
    return new Notification({
      id: '',
      tenantId,
      workOrderId: input.workOrderId,
      customerId: input.customerId,
      tipoEvento: input.tipoEvento,
      template: input.template ?? null,
      estado: NotificationStatus.PENDIENTE,
      intentos: 0,
      payload: input.payload,
      scheduledAt: null,
      sentAt: now,
      createdAt: now,
      updatedAt: now,
    });
  }

  markSent(): void {
    this.props.estado = NotificationStatus.ENVIADO;
    this.props.intentos += 1;
    this.props.sentAt = new Date();
    this.props.updatedAt = this.props.sentAt;
  }

  markFailed(): void {
    this.props.estado = NotificationStatus.FALLIDO;
    this.props.intentos += 1;
    this.props.updatedAt = new Date();
  }

  toPrimitives(): NotificationProps {
    return { ...this.props, payload: { ...this.props.payload } };
  }

  get id(): string {
    return this.props.id;
  }

  get payload(): Record<string, unknown> {
    return this.props.payload;
  }
}
