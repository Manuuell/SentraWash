import { Notification } from '../domain/notification';

export class NotificationResponse {
  id!: string;
  tipoEvento!: string;
  estado!: string;
  intentos!: number;
  workOrderId!: string | null;
  customerId!: string | null;
  payload!: Record<string, unknown>;
  sentAt!: Date | null;
  createdAt!: Date;

  static from(notification: Notification): NotificationResponse {
    const p = notification.toPrimitives();
    return {
      id: p.id,
      tipoEvento: p.tipoEvento,
      estado: p.estado,
      intentos: p.intentos,
      workOrderId: p.workOrderId,
      customerId: p.customerId,
      payload: p.payload,
      sentAt: p.sentAt,
      createdAt: p.createdAt,
    };
  }
}
