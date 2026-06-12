import { SetMetadata } from '@nestjs/common';

/**
 * Marca un handler/controlador como NO multi-tenant (health checks, webhooks
 * que resuelven el tenant por su cuenta, etc.). El TenantTransactionInterceptor
 * lo omite y no abre transacción con `app.current_tenant`.
 */
export const SKIP_TENANT_KEY = 'skipTenant';
export const SkipTenant = () => SetMetadata(SKIP_TENANT_KEY, true);
