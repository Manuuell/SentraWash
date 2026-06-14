import { IsEnum, IsNumber, IsOptional, IsPositive, IsString, IsUUID, Length } from 'class-validator';
import { CashMovementType } from '../../domain/cash-movement-type';

export class RegisterCashMovementDto {
  @IsEnum(CashMovementType)
  tipo!: CashMovementType;

  @IsString()
  @Length(1, 200)
  concepto!: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  monto!: number;

  @IsOptional()
  @IsUUID()
  workOrderId?: string;

  @IsOptional()
  @IsUUID()
  paymentId?: string;

  @IsOptional()
  @IsUUID()
  registradoPor?: string;
}
