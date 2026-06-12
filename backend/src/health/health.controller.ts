import { Controller, Get } from '@nestjs/common';
import { Public } from '../core/auth/public.decorator';
import { SkipTenant } from '../core/tenancy/skip-tenant.decorator';

/** Endpoint de salud para el ALB/health checks. No requiere auth ni tenant. */
@Controller('health')
export class HealthController {
  @Public()
  @SkipTenant()
  @Get()
  check() {
    return {
      status: 'ok',
      service: 'sentrawash-backend',
      timestamp: new Date().toISOString(),
    };
  }
}
