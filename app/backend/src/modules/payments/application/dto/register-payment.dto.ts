import { IsEnum, IsNumber, IsOptional, IsPositive, IsString, IsUUID, MaxLength } from 'class-validator';
import { PaymentMethod } from '../../domain/payment-method';

export class RegisterPaymentDto {
  @IsUUID()
  workOrderId!: string;

  @IsEnum(PaymentMethod)
  metodo!: PaymentMethod;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  monto!: number;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  referencia?: string;

  @IsOptional()
  @IsUUID()
  registradoPor?: string;
}
