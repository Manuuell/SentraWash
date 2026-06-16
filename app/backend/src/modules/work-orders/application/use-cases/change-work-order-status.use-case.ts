import { Inject, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { DomainError, NotFoundError } from '../../../../core/common/domain-error';
import { err, ok, Result } from '../../../../core/common/result';
import { UseCase } from '../../../../core/common/use-case';
import { WorkOrder } from '../../domain/work-order';
import {
  WORK_ORDER_DELIVERED_EVENT,
  WorkOrderDeliveredEvent,
} from '../../domain/work-order-delivered.event';
import {
  WORK_ORDER_READY_EVENT,
  WorkOrderReadyEvent,
} from '../../domain/work-order-ready.event';
import { WorkOrderStatus } from '../../domain/work-order-status';
import { WORK_ORDER_REPOSITORY, WorkOrderRepository } from '../../domain/work-order.repository';

export interface ChangeWorkOrderStatusInput {
  id: string;
  estado: WorkOrderStatus;
}

@Injectable()
export class ChangeWorkOrderStatusUseCase
  implements UseCase<ChangeWorkOrderStatusInput, WorkOrder>
{
  constructor(
    @Inject(WORK_ORDER_REPOSITORY) private readonly orders: WorkOrderRepository,
    private readonly events: EventEmitter2,
  ) {}

  async execute({ id, estado }: ChangeWorkOrderStatusInput): Promise<Result<WorkOrder>> {
    const order = await this.orders.findById(id);
    if (!order) {
      return err(new NotFoundError(`Orden ${id} no encontrada`));
    }
    try {
      order.changeStatus(estado);
    } catch (error) {
      if (error instanceof DomainError) return err(error);
      throw error;
    }

    const saved = await this.orders.save(order);

    // Notificaciones al cliente según la etapa (async, desacoplado).
    const p = saved.toPrimitives();
    if (estado === WorkOrderStatus.LISTO) {
      const event: WorkOrderReadyEvent = {
        tenantId: p.tenantId,
        orderId: p.id,
        numeroOrden: p.numeroOrden,
        customerId: p.customerId,
      };
      this.events.emit(WORK_ORDER_READY_EVENT, event);
    } else if (estado === WorkOrderStatus.ENTREGADO) {
      const servicios = p.items
        .map((it) => (it.cantidad > 1 ? `${it.descripcion} x${it.cantidad}` : it.descripcion))
        .join(', ');
      const total = '$' + p.total.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
      const event: WorkOrderDeliveredEvent = {
        tenantId: p.tenantId,
        orderId: p.id,
        numeroOrden: p.numeroOrden,
        customerId: p.customerId,
        servicios: servicios || 'Servicio de lavado',
        total,
      };
      this.events.emit(WORK_ORDER_DELIVERED_EVENT, event);
    }

    return ok(saved);
  }
}
