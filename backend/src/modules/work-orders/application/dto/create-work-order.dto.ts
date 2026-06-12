import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { WorkOrderChannel } from '../../domain/work-order-channel';
import { CreateWorkOrderItemDto } from './create-work-order-item.dto';

export class CreateWorkOrderDto {
  @IsUUID()
  vehicleId!: string;

  @IsOptional()
  @IsUUID()
  customerId?: string;

  @IsOptional()
  @IsUUID()
  operarioId?: string;

  @IsOptional()
  @IsEnum(WorkOrderChannel)
  canalOrigen?: WorkOrderChannel;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  observaciones?: string;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  descuento?: number;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateWorkOrderItemDto)
  items!: CreateWorkOrderItemDto[];
}
