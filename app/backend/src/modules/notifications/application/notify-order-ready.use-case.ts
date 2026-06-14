import { Inject, Injectable } from '@nestjs/common';
import { TenantManager } from '../../../core/tenancy/tenant-manager.service';
import {
  CUSTOMER_REPOSITORY,
  CustomerRepository,
} from '../../customers/domain/customer.repository';
import { WorkOrderReadyEvent } from '../../work-orders/domain/work-order-ready.event';
import { Notification } from '../domain/notification';
import { NotificationEvent } from '../domain/notification-event';
import {
  NOTIFICATION_REPOSITORY,
  NotificationRepository,
} from '../domain/notification.repository';
import { NotificationSender } from './notification-sender.service';

/**
 * Crea y envía la notificación "vehículo listo" para una orden. Se ejecuta dentro
 * del TenantScope del listener, por lo que los repos quedan acotados por RLS.
 */
@Injectable()
export class NotifyOrderReadyUseCase {
  constructor(
    @Inject(CUSTOMER_REPOSITORY) private readonly customers: CustomerRepository,
    @Inject(NOTIFICATION_REPOSITORY) private readonly notifications: NotificationRepository,
    private readonly sender: NotificationSender,
    private readonly tenant: TenantManager,
  ) {}

  async execute(event: WorkOrderReadyEvent): Promise<void> {
    let telefono: string | null = null;
    if (event.customerId) {
      const customer = await this.customers.findById(event.customerId);
      telefono = customer ? customer.toPrimitives().telefono : null;
    }

    const mensaje =
      `🚗 ¡Tu vehículo de la orden #${event.numeroOrden} ya está listo para recoger! ` +
      `Gracias por confiar en nosotros. 🙌`;

    const notification = Notification.create(this.tenant.tenantId, {
      workOrderId: event.orderId,
      customerId: event.customerId,
      tipoEvento: NotificationEvent.ORDEN_LISTA,
      payload: { telefono, mensaje, numeroOrden: event.numeroOrden },
    });

    const saved = await this.notifications.save(notification);
    await this.sender.send(saved);
  }
}
