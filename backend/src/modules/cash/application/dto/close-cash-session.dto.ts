import { IsNumber, IsOptional, IsUUID, Min } from 'class-validator';

export class CloseCashSessionDto {
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  saldoReal!: number;

  @IsOptional()
  @IsUUID()
  cerradaPor?: string;
}
