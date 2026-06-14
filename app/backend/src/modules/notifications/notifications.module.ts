import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomersModule } from '../customers/customers.module';
import { WhatsAppModule } from '../whatsapp/whatsapp.module';
import { ListNotificationsUseCase } from './application/list-notifications.use-case';
import { NotificationSender } from './application/notification-sender.service';
import { NotifyOrderReadyUseCase } from './application/notify-order-ready.use-case';
import { OrderReadyListener } from './application/order-ready.listener';
import { ProcessPendingNotificationsUseCase } from './application/process-pending-notifications.use-case';
import { NOTIFICATION_REPOSITORY } from './domain/notification.repository';
import { TypeormNotificationRepository } from './infrastructure/persistence/typeorm-notification.repository';
import { NotificationOrmEntity } from './infrastructure/persistence/notification.orm-entity';
import { NotificationsController } from './presentation/notifications.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([NotificationOrmEntity]),
    CustomersModule, // teléfono del cliente
    WhatsAppModule, // puerto de mensajería + número del tenant
  ],
  controllers: [NotificationsController],
  providers: [
    NotificationSender,
    NotifyOrderReadyUseCase,
    OrderReadyListener,
    ProcessPendingNotificationsUseCase,
    ListNotificationsUseCase,
    { provide: NOTIFICATION_REPOSITORY, useClass: TypeormNotificationRepository },
  ],
})
export class NotificationsModule {}
