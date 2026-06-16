import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { TenantScopeRunner } from '../../../core/tenancy/tenant-scope.runner';
import {
  WORK_ORDER_CREATED_EVENT,
  WorkOrderCreatedEvent,
} from '../../work-orders/domain/work-order-created.event';
import { NotifyOrderCreatedUseCase } from './notify-order-created.use-case';

/** Escucha "orden creada" y dispara la confirmación dentro de un TenantScope. */
@Injectable()
export class OrderCreatedListener {
  private readonly logger = new Logger(OrderCreatedListener.name);

  constructor(
    private readonly scope: TenantScopeRunner,
    private readonly notify: NotifyOrderCreatedUseCase,
  ) {}

  @OnEvent(WORK_ORDER_CREATED_EVENT)
  async handle(event: WorkOrderCreatedEvent): Promise<void> {
    try {
      await this.scope.run(event.tenantId, () => this.notify.execute(event));
    } catch (error) {
      this.logger.error(`Error notificando creación de la orden ${event.orderId}: ${error}`);
    }
  }
}
