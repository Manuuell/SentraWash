import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WhatsAppConfig } from '../../../core/config/configuration';
import { TenantManager } from '../../../core/tenancy/tenant-manager.service';
import {
  CUSTOMER_REPOSITORY,
  CustomerRepository,
} from '../../customers/domain/customer.repository';
import { WorkOrderDeliveredEvent } from '../../work-orders/domain/work-order-delivered.event';
import { Notification } from '../domain/notification';
import { NotificationEvent } from '../domain/notification-event';
import {
  NOTIFICATION_REPOSITORY,
  NotificationRepository,
} from '../domain/notification.repository';
import { NotificationSender } from './notification-sender.service';

/**
 * Recibo al ENTREGAR la orden: template "recibo" con número de orden, nombre del
 * cliente, servicios y total.
 */
@Injectable()
export class NotifyOrderDeliveredUseCase {
  constructor(
    @Inject(CUSTOMER_REPOSITORY) private readonly customers: CustomerRepository,
    @Inject(NOTIFICATION_REPOSITORY) private readonly notifications: NotificationRepository,
    private readonly sender: NotificationSender,
    private readonly tenant: TenantManager,
    private readonly config: ConfigService,
  ) {}

  async execute(event: WorkOrderDeliveredEvent): Promise<void> {
    let telefono: string | null = null;
    let nombre = 'Cliente';
    if (event.customerId) {
      const customer = await this.customers.findById(event.customerId);
      if (customer) {
        const c = customer.toPrimitives();
        telefono = c.telefono;
        nombre = c.nombre;
      }
    }

    const wa = this.config.get<WhatsAppConfig>('whatsapp')!;
    const mensaje =
      `🧾 Recibo — Orden #${event.numeroOrden}. Cliente: ${nombre}. ` +
      `Servicios: ${event.servicios}. Total: ${event.total}`;
    const template = {
      name: wa.deliveredTemplate,
      language: wa.templateLanguage,
      bodyParams: [String(event.numeroOrden), nombre, event.servicios, event.total],
    };

    const notification = Notification.create(this.tenant.tenantId, {
      workOrderId: event.orderId,
      customerId: event.customerId,
      tipoEvento: NotificationEvent.ORDEN_ENTREGADA,
      payload: { telefono, mensaje, template, numeroOrden: event.numeroOrden },
    });

    const saved = await this.notifications.save(notification);
    await this.sender.send(saved);
  }
}
