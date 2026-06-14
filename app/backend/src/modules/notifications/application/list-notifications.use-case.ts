import { Inject, Injectable } from '@nestjs/common';
import { ok, Result } from '../../../core/common/result';
import { Notification } from '../domain/notification';
import {
  NOTIFICATION_REPOSITORY,
  NotificationRepository,
} from '../domain/notification.repository';

@Injectable()
export class ListNotificationsUseCase {
  constructor(
    @Inject(NOTIFICATION_REPOSITORY) private readonly notifications: NotificationRepository,
  ) {}

  async execute(): Promise<Result<Notification[]>> {
    return ok(await this.notifications.findAll());
  }
}
