import { Inject, Injectable } from '@nestjs/common';
import { ok, Result } from '../../../../core/common/result';
import { WorkOrder } from '../../domain/work-order';
import { WORK_ORDER_REPOSITORY, WorkOrderRepository } from '../../domain/work-order.repository';

@Injectable()
export class ListWorkOrdersUseCase {
  constructor(
    @Inject(WORK_ORDER_REPOSITORY) private readonly orders: WorkOrderRepository,
  ) {}

  async execute(): Promise<Result<WorkOrder[]>> {
    return ok(await this.orders.findAll());
  }
}
