import { IsInt, IsNumber, IsOptional, IsString, IsUUID, MaxLength, Min } from 'class-validator';

/**
 * Ítem de una orden. Si se envía `serviceId`, el precio y la descripción se toman
 * del catálogo (a menos que se sobreescriban). Si no, es un ítem libre y requiere
 * `descripcion` + `precioUnitario`.
 */
export class CreateWorkOrderItemDto {
  @IsOptional()
  @IsUUID()
  serviceId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  descripcion?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  cantidad?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  precioUnitario?: number;
}
