import { Inject, Injectable } from '@nestjs/common';
import { NotFoundError } from '../../../../core/common/domain-error';
import { err, ok, Result } from '../../../../core/common/result';
import { UseCase } from '../../../../core/common/use-case';
import { Vehicle } from '../../domain/vehicle';
import { VEHICLE_REPOSITORY, VehicleRepository } from '../../domain/vehicle.repository';

@Injectable()
export class GetVehicleUseCase implements UseCase<string, Vehicle> {
  constructor(
    @Inject(VEHICLE_REPOSITORY) private readonly vehicles: VehicleRepository,
  ) {}

  async execute(id: string): Promise<Result<Vehicle>> {
    const vehicle = await this.vehicles.findById(id);
    if (!vehicle) {
      return err(new NotFoundError(`Vehículo ${id} no encontrado`));
    }
    return ok(vehicle);
  }
}
