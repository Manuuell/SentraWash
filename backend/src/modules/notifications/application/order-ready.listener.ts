import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { TenantScopeRunner } from '../../../core/tenancy/tenant-scope.runner';
import {
  WORK_ORDER_READY_EVENT,
  WorkOrderReadyEvent,
} from '../../work-orders/domain/work-order-ready.event';
import { NotifyOrderReadyUseCase } from './notify-order-ready.use-case';

/**
 * Escucha el evento "orden lista" y dispara la notificación dentro de un
 * TenantScope (transacción + RLS). Análogo a un consumidor de SQS/EventBridge.
 */
@Injectable()
export class OrderReadyListener {
  private readonly logger = new Logger(OrderReadyListener.name);

  constructor(
    private readonly scope: TenantScopeRunner,
    private readonly notify: NotifyOrderReadyUseCase,
  ) {}

  @OnEvent(WORK_ORDER_READY_EVENT)
  async handle(event: WorkOrderReadyEvent): Promise<void> {
    try {
      await this.scope.run(event.tenantId, () => this.notify.execute(event));
    } catch (error) {
      this.logger.error(`Error notificando la orden ${event.orderId}: ${error}`);
    }
  }
}
