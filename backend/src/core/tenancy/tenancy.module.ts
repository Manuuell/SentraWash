import { Global, Module } from '@nestjs/common';
import { TenantManager } from './tenant-manager.service';
import { TenantScopeRunner } from './tenant-scope.runner';

/**
 * Módulo global de tenancy: expone TenantManager y TenantScopeRunner.
 * El TenantTransactionInterceptor se registra como interceptor global en AppModule.
 */
@Global()
@Module({
  providers: [TenantManager, TenantScopeRunner],
  exports: [TenantManager, TenantScopeRunner],
})
export class TenancyModule {}
