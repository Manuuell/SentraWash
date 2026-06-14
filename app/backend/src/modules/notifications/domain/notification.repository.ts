import { Notification } from './notification';

export interface NotificationRepository {
  findAll(): Promise<Notification[]>;
  /** Notificaciones por enviar o reintentables (no enviadas, intentos < 3). */
  findPending(): Promise<Notification[]>;
  save(notification: Notification): Promise<Notification>;
}

export const NOTIFICATION_REPOSITORY = Symbol('NOTIFICATION_REPOSITORY');
