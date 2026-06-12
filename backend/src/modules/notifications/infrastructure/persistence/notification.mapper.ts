import { Notification } from '../../domain/notification';
import { NotificationOrmEntity } from './notification.orm-entity';

export class NotificationMapper {
  static toDomain(o: NotificationOrmEntity): Notification {
    return Notification.rehydrate({
      id: o.id,
      tenantId: o.tenantId,
      workOrderId: o.workOrderId ?? null,
      customerId: o.customerId ?? null,
      tipoEvento: o.tipoEvento,
      template: o.template ?? null,
      estado: o.estado,
      intentos: o.intentos,
      payload: o.payload ?? {},
      scheduledAt: o.scheduledAt ?? null,
      sentAt: o.sentAt ?? null,
      createdAt: o.createdAt,
      updatedAt: o.updatedAt,
    });
  }

  static toOrm(notification: Notification): NotificationOrmEntity {
    const p = notification.toPrimitives();
    const o = new NotificationOrmEntity();
    if (p.id) o.id = p.id;
    o.tenantId = p.tenantId;
    o.workOrderId = p.workOrderId;
    o.customerId = p.customerId;
    o.tipoEvento = p.tipoEvento;
    o.template = p.template;
    o.estado = p.estado;
    o.intentos = p.intentos;
    o.payload = p.payload;
    o.scheduledAt = p.scheduledAt;
    o.sentAt = p.sentAt;
    return o;
  }
}
