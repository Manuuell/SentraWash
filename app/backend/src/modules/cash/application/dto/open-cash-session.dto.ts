import { IsNumber, IsOptional, IsUUID, Min } from 'class-validator';

export class OpenCashSessionDto {
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  baseInicial!: number;

  @IsOptional()
  @IsUUID()
  abiertaPor?: string;
}
