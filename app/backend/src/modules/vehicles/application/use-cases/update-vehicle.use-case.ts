import { Inject, Injectable } from '@nestjs/common';
import { ConflictError, DomainError, NotFoundError } from '../../../../core/common/domain-error';
import { err, ok, Result } from '../../../../core/common/result';
import { UseCase } from '../../../../core/common/use-case';
import { Vehicle } from '../../domain/vehicle';
import { VEHICLE_REPOSITORY, VehicleRepository } from '../../domain/vehicle.repository';
import { UpdateVehicleDto } from '../dto/update-vehicle.dto';

export interface UpdateVehicleInput {
  id: string;
  data: UpdateVehicleDto;
}

@Injectable()
export class UpdateVehicleUseCase implements UseCase<UpdateVehicleInput, Vehicle> {
  constructor(
    @Inject(VEHICLE_REPOSITORY) private readonly vehicles: VehicleRepository,
  ) {}

  async execute({ id, data }: UpdateVehicleInput): Promise<Result<Vehicle>> {
    const vehicle = await this.vehicles.findById(id);
    if (!vehicle) {
      return err(new NotFoundError(`Vehículo ${id} no encontrado`));
    }

    try {
      vehicle.update(data);
    } catch (error) {
      if (error instanceof DomainError) return err(error);
      throw error;
    }

    if (data.placa !== undefined) {
      const duplicate = await this.vehicles.findByPlaca(vehicle.placa);
      if (duplicate && duplicate.id !== id) {
        return err(new ConflictError(`Ya existe un vehículo con placa ${vehicle.placa}`));
      }
    }

    return ok(await this.vehicles.save(vehicle));
  }
}
