import { Controller, Get, Header, Inject, Param } from '@nestjs/common';
import { Public } from '../../../core/auth/public.decorator';
import { SkipTenant } from '../../../core/tenancy/skip-tenant.decorator';
import { TenantScopeRunner } from '../../../core/tenancy/tenant-scope.runner';
import {
  VEHICLE_REPOSITORY,
  VehicleRepository,
} from '../../vehicles/domain/vehicle.repository';
import { WORK_ORDER_REPOSITORY, WorkOrderRepository } from '../domain/work-order.repository';
import { renderTrackingPage, renderNotFoundPage } from './tracking.view';

/**
 * Seguimiento PÚBLICO de una orden (sin auth). El cliente abre el link y ve el
 * estado de su vehículo. La URL lleva tenant + orden (ambos UUID, no adivinables,
 * como una URL prefirmada). Se fija el tenant manualmente para satisfacer RLS.
 */
@Controller('track')
export class TrackingController {
  constructor(
    @Inject(WORK_ORDER_REPOSITORY) private readonly orders: WorkOrderRepository,
    @Inject(VEHICLE_REPOSITORY) private readonly vehicles: VehicleRepository,
    private readonly scope: TenantScopeRunner,
  ) {}

  @Public()
  @SkipTenant()
  @Get(':tenantId/:orderId')
  @Header('Content-Type', 'text/html; charset=utf-8')
  async track(
    @Param('tenantId') tenantId: string,
    @Param('orderId') orderId: string,
  ): Promise<string> {
    const data = await this.scope.run(tenantId, async () => {
      const order = await this.orders.findById(orderId);
      if (!order) return null;
      const p = order.toPrimitives();
      const vehicle = p.vehicleId ? await this.vehicles.findById(p.vehicleId) : null;
      return { order: p, vehicle: vehicle?.toPrimitives() ?? null };
    });

    if (!data) return renderNotFoundPage();
    return renderTrackingPage(data.order, data.vehicle);
  }
}
