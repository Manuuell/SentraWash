import { Controller, Get, Post } from '@nestjs/common';
import { unwrap } from '../../../core/common/unwrap';
import { ListNotificationsUseCase } from '../application/list-notifications.use-case';
import { ProcessPendingNotificationsUseCase } from '../application/process-pending-notifications.use-case';
import { NotificationResponse } from './notification.response';

@Controller('notifications')
export class NotificationsController {
  constructor(
    private readonly listNotifications: ListNotificationsUseCase,
    private readonly processPending: ProcessPendingNotificationsUseCase,
  ) {}

  @Get()
  async list(): Promise<NotificationResponse[]> {
    return unwrap(await this.listNotifications.execute()).map(NotificationResponse.from);
  }

  /** Reprocesa notificaciones pendientes/fallidas del tenant (reintentos). */
  @Post('process')
  async process(): Promise<{ procesadas: number; enviadas: number }> {
    return unwrap(await this.processPending.execute());
  }
}
