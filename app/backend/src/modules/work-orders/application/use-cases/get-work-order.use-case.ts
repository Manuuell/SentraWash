import { Inject, Injectable } from '@nestjs/common';
import { NotFoundError } from '../../../../core/common/domain-error';
import { err, ok, Result } from '../../../../core/common/result';
import { UseCase } from '../../../../core/common/use-case';
import { WorkOrder } from '../../domain/work-order';
import { WORK_ORDER_REPOSITORY, WorkOrderRepository } from '../../domain/work-order.repository';

@Injectable()
export class GetWorkOrderUseCase implements UseCase<string, WorkOrder> {
  constructor(
    @Inject(WORK_ORDER_REPOSITORY) private readonly orders: WorkOrderRepository,
  ) {}

  async execute(id: string): Promise<Result<WorkOrder>> {
    const order = await this.orders.findById(id);
    if (!order) {
      return err(new NotFoundError(`Orden ${id} no encontrada`));
    }
    return ok(order);
  }
}
