import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { TenantScopeRunner } from '../../../core/tenancy/tenant-scope.runner';
import {
  WORK_ORDER_DELIVERED_EVENT,
  WorkOrderDeliveredEvent,
} from '../../work-orders/domain/work-order-delivered.event';
import { NotifyOrderDeliveredUseCase } from './notify-order-delivered.use-case';

/** Escucha "orden entregada" y dispara el recibo dentro de un TenantScope. */
@Injectable()
export class OrderDeliveredListener {
  private readonly logger = new Logger(OrderDeliveredListener.name);

  constructor(
    private readonly scope: TenantScopeRunner,
    private readonly notify: NotifyOrderDeliveredUseCase,
  ) {}

  @OnEvent(WORK_ORDER_DELIVERED_EVENT)
  async handle(event: WorkOrderDeliveredEvent): Promise<void> {
    try {
      await this.scope.run(event.tenantId, () => this.notify.execute(event));
    } catch (error) {
      this.logger.error(`Error enviando recibo de la orden ${event.orderId}: ${error}`);
    }
  }
}
