import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WhatsAppConfig } from '../../core/config/configuration';
import { CustomersModule } from '../customers/customers.module';
import { ServicesModule } from '../services/services.module';
import { VehiclesModule } from '../vehicles/vehicles.module';
import { WorkOrdersModule } from '../work-orders/work-orders.module';
import { ProcessInboundMessageUseCase } from './application/process-inbound-message.use-case';
import { MESSAGING_PORT, MessagingPort } from './domain/messaging.port';
import { WA_BUSINESS_ACCOUNT_REPOSITORY } from './domain/wa-business-account.repository';
import { WA_CONVERSATION_REPOSITORY } from './domain/wa-conversation.repository';
import { LoggingMessagingAdapter } from './infrastructure/messaging/logging-messaging.adapter';
import { MetaCloudAdapter } from './infrastructure/messaging/meta-cloud.adapter';
import { TypeormWaBusinessAccountRepository } from './infrastructure/persistence/typeorm-wa-business-account.repository';
import { TypeormWaConversationRepository } from './infrastructure/persistence/typeorm-wa-conversation.repository';
import { WaBusinessAccountOrmEntity } from './infrastructure/persistence/wa-business-account.orm-entity';
import { WaConversationOrmEntity } from './infrastructure/persistence/wa-conversation.orm-entity';
import { WhatsAppController } from './presentation/whatsapp.controller';

/**
 * El proveedor de mensajería se elige en runtime: MetaCloudAdapter si hay token
 * de Meta configurado, o LoggingMessagingAdapter (simulado) en desarrollo.
 */
const messagingProvider = {
  provide: MESSAGING_PORT,
  useFactory: (config: ConfigService): MessagingPort => {
    const cfg = config.get<WhatsAppConfig>('whatsapp')!;
    return cfg.accessToken ? new MetaCloudAdapter(config) : new LoggingMessagingAdapter();
  },
  inject: [ConfigService],
};

@Module({
  imports: [
    TypeOrmModule.forFeature([WaConversationOrmEntity, WaBusinessAccountOrmEntity]),
    CustomersModule,
    VehiclesModule,
    ServicesModule,
    WorkOrdersModule,
  ],
  controllers: [WhatsAppController],
  providers: [
    ProcessInboundMessageUseCase,
    messagingProvider,
    { provide: WA_CONVERSATION_REPOSITORY, useClass: TypeormWaConversationRepository },
    { provide: WA_BUSINESS_ACCOUNT_REPOSITORY, useClass: TypeormWaBusinessAccountRepository },
  ],
  // Exporta el puerto de mensajería y el repo de cuentas para el módulo de notificaciones.
  exports: [MESSAGING_PORT, WA_BUSINESS_ACCOUNT_REPOSITORY],
})
export class WhatsAppModule {}
