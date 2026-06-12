import { Inject, Injectable } from '@nestjs/common';
import { ok, Result } from '../../../core/common/result';
import { NotificationStatus } from '../domain/notification-status';
import {
  NOTIFICATION_REPOSITORY,
  NotificationRepository,
} from '../domain/notification.repository';
import { NotificationSender } from './notification-sender.service';

/**
 * Reprocesa notificaciones pendientes/fallidas (reintentos). En producción lo
 * dispararía un cron o un consumidor de SQS por cada tenant; aquí se expone como
 * endpoint para el tenant actual.
 */
@Injectable()
export class ProcessPendingNotificationsUseCase {
  constructor(
    @Inject(NOTIFICATION_REPOSITORY) private readonly notifications: NotificationRepository,
    private readonly sender: NotificationSender,
  ) {}

  async execute(): Promise<Result<{ procesadas: number; enviadas: number }>> {
    const pending = await this.notifications.findPending();
    let enviadas = 0;
    for (const notification of pending) {
      const result = await this.sender.send(notification);
      if (result.toPrimitives().estado === NotificationStatus.ENVIADO) enviadas++;
    }
    return ok({ procesadas: pending.length, enviadas });
  }
}
