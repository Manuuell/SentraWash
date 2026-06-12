import { PartialType } from '@nestjs/mapped-types';
import { CreateVehicleDto } from './create-vehicle.dto';

/** Todos los campos opcionales para actualizaciones parciales (PATCH). */
export class UpdateVehicleDto extends PartialType(CreateVehicleDto) {}
