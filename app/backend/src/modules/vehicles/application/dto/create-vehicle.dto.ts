import {
  IsEnum,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  MaxLength,
} from 'class-validator';
import { VehicleType } from '../../domain/vehicle-type';

export class CreateVehicleDto {
  @IsOptional()
  @IsUUID()
  customerId?: string;

  @IsString()
  @Length(5, 10)
  placa!: string;

  @IsEnum(VehicleType)
  tipo!: VehicleType;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  marca?: string;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  modelo?: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  color?: string;

  @IsOptional()
  @IsObject()
  customFields?: Record<string, unknown>;
}
