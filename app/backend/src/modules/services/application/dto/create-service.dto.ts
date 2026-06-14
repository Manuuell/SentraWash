import {
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateServiceDto {
  @IsString()
  @Length(1, 120)
  nombre!: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  descripcion?: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  precio!: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  duracionMin?: number;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  categoria?: string;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}
