import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WhatsAppConfig } from '../../../core/config/configuration';
import { TenantManager } from '../../../core/tenancy/tenant-manager.service';
import {
  CUSTOMER_REPOSITORY,
  CustomerRepository,
} from '../../customers/domain/customer.repository';
import { WorkOrderCreatedEvent } from '../../work-orders/domain/work-order-created.event';
import { Notification } from '../domain/notification';
import { NotificationEvent } from '../domain/notification-event';
import {
  NOTIFICATION_REPOSITORY,
  NotificationRepository,
} from '../domain/notification.repository';
import { NotificationSender } from './notification-sender.service';

/**
 * Confirmación al CREAR la orden: template "orden de servicio" con número de
 * orden, placa y tipo de vehículo.
 */
@Injectable()
export class NotifyOrderCreatedUseCase {
  constructor(
    @Inject(CUSTOMER_REPOSITORY) private readonly customers: CustomerRepository,
    @Inject(NOTIFICATION_REPOSITORY) private readonly notifications: NotificationRepository,
    private readonly sender: NotificationSender,
    private readonly tenant: TenantManager,
    private readonly config: ConfigService,
  ) {}

  async execute(event: WorkOrderCreatedEvent): Promise<void> {
    let telefono: string | null = null;
    if (event.customerId) {
      const customer = await this.customers.findById(event.customerId);
      telefono = customer ? customer.toPrimitives().telefono : null;
    }

    const wa = this.config.get<WhatsAppConfig>('whatsapp')!;
    const mensaje =
      `✅ Recibimos tu vehículo. Orden de servicio #${event.numeroOrden}. ` +
      `Placa: ${event.placa} · Tipo: ${event.tipoVehiculo}`;
    const template = {
      name: wa.createdTemplate,
      language: wa.templateLanguage,
      bodyParams: [String(event.numeroOrden), event.placa, event.tipoVehiculo],
    };

    const notification = Notification.create(this.tenant.tenantId, {
      workOrderId: event.orderId,
      customerId: event.customerId,
      tipoEvento: NotificationEvent.ORDEN_CREADA,
      payload: { telefono, mensaje, template, numeroOrden: event.numeroOrden },
    });

    const saved = await this.notifications.save(notification);
    await this.sender.send(saved);
  }
}
