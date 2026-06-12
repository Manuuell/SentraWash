import { IsEnum } from 'class-validator';
import { WorkOrderStatus } from '../../domain/work-order-status';

export class ChangeStatusDto {
  @IsEnum(WorkOrderStatus)
  estado!: WorkOrderStatus;
}
