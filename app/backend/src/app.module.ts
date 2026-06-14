import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { EventEmitterModule } from '@nestjs/event-emitter';
import configuration from './core/config/configuration';
import { AuthModule } from './core/auth/auth.module';
import { JwtAuthGuard } from './core/auth/jwt-auth.guard';
import { RolesGuard } from './core/auth/roles.guard';
import { DomainExceptionFilter } from './core/common/filters/domain-exception.filter';
import { DatabaseModule } from './core/database/database.module';
import { StorageModule } from './core/storage/storage.module';
import { TenancyModule } from './core/tenancy/tenancy.module';
import { TenantTransactionInterceptor } from './core/tenancy/tenant-transaction.interceptor';
import { HealthController } from './health/health.controller';
import { VehiclesModule } from './modules/vehicles/vehicles.module';
import { CustomersModule } from './modules/customers/customers.module';
import { ServicesModule } from './modules/services/services.module';
import { WorkOrdersModule } from './modules/work-orders/work-orders.module';
import { CashModule } from './modules/cash/cash.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { WhatsAppModule } from './modules/whatsapp/whatsapp.module';
import { NotificationsModule } from './modules/notifications/notifications.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [configuration], envFilePath: '.env' }),
    EventEmitterModule.forRoot(),
    DatabaseModule,
    AuthModule,
    TenancyModule,
    StorageModule,
    VehiclesModule,
    CustomersModule,
    ServicesModule,
    WorkOrdersModule,
    CashModule,
    PaymentsModule,
    WhatsAppModule,
    NotificationsModule,
  ],
  controllers: [HealthController],
  providers: [
    // Filtro global: traduce errores de dominio/HTTP a respuestas coherentes.
    { provide: APP_FILTER, useClass: DomainExceptionFilter },
    // Autenticación (JWT Cognito) y autorización por rol.
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    // Aislamiento multi-tenant + transacción con RLS por petición.
    { provide: APP_INTERCEPTOR, useClass: TenantTransactionInterceptor },
  ],
})
export class AppModule {}
