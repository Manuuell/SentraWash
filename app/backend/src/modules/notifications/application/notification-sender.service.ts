import { Inject, Injectable } from '@nestjs/common';
import { TenantManager } from '../../../core/tenancy/tenant-manager.service';
import { MESSAGING_PORT, MessagingPort } from '../../whatsapp/domain/messaging.port';
import {
  WA_BUSINESS_ACCOUNT_REPOSITORY,
  WaBusinessAccountRepository,
} from '../../whatsapp/domain/wa-business-account.repository';
import { Notification } from '../domain/notification';
import {
  NOTIFICATION_REPOSITORY,
  NotificationRepository,
} from '../domain/notification.repository';

/**
 * Envía una notificación por el puerto de mensajería (WhatsApp) resolviendo el
 * número emisor del tenant, y marca el resultado (enviado/fallido).
 */
@Injectable()
export class NotificationSender {
  constructor(
    @Inject(MESSAGING_PORT) private readonly messaging: MessagingPort,
    @Inject(WA_BUSINESS_ACCOUNT_REPOSITORY) private readonly accounts: WaBusinessAccountRepository,
    @Inject(NOTIFICATION_REPOSITORY) private readonly notifications: NotificationRepository,
    private readonly tenant: TenantManager,
  ) {}

  async send(notification: Notification): Promise<Notification> {
    const payload = notification.payload;
    const telefono = typeof payload['telefono'] === 'string' ? payload['telefono'] : null;
    const mensaje = typeof payload['mensaje'] === 'string' ? payload['mensaje'] : null;

    if (!telefono || !mensaje) {
      notification.markFailed();
      return this.notifications.save(notification);
    }

    const account = await this.accounts.findByTenant(this.tenant.tenantId);
    try {
      await this.messaging.sendText(telefono, mensaje, account?.phoneNumberId);
      notification.markSent();
    } catch {
      notification.markFailed();
    }
    return this.notifications.save(notification);
  }
}
