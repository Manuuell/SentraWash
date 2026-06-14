import { Inject, Injectable } from '@nestjs/common';
import { ok, Result } from '../../../../core/common/result';
import { Vehicle } from '../../domain/vehicle';
import { VEHICLE_REPOSITORY, VehicleRepository } from '../../domain/vehicle.repository';

@Injectable()
export class ListVehiclesUseCase {
  constructor(
    @Inject(VEHICLE_REPOSITORY) private readonly vehicles: VehicleRepository,
  ) {}

  async execute(): Promise<Result<Vehicle[]>> {
    return ok(await this.vehicles.findAll());
  }
}
