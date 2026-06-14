import { Inject, Injectable } from '@nestjs/common';
import { NotFoundError } from '../../../../core/common/domain-error';
import { err, ok, Result } from '../../../../core/common/result';
import { UseCase } from '../../../../core/common/use-case';
import { WORK_ORDER_REPOSITORY, WorkOrderRepository } from '../../domain/work-order.repository';

@Injectable()
export class DeleteWorkOrderUseCase implements UseCase<string, void> {
  constructor(
    @Inject(WORK_ORDER_REPOSITORY) private readonly orders: WorkOrderRepository,
  ) {}

  async execute(id: string): Promise<Result<void>> {
    const order = await this.orders.findById(id);
    if (!order) {
      return err(new NotFoundError(`Orden ${id} no encontrada`));
    }
    await this.orders.delete(id);
    return ok(undefined);
  }
}
