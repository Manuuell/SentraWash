import { Inject, Injectable } from '@nestjs/common';
import { NotFoundError } from '../../../../core/common/domain-error';
import { err, ok, Result } from '../../../../core/common/result';
import { UseCase } from '../../../../core/common/use-case';
import { VEHICLE_REPOSITORY, VehicleRepository } from '../../domain/vehicle.repository';

@Injectable()
export class DeleteVehicleUseCase implements UseCase<string, void> {
  constructor(
    @Inject(VEHICLE_REPOSITORY) private readonly vehicles: VehicleRepository,
  ) {}

  async execute(id: string): Promise<Result<void>> {
    const vehicle = await this.vehicles.findById(id);
    if (!vehicle) {
      return err(new NotFoundError(`Vehículo ${id} no encontrado`));
    }
    await this.vehicles.delete(id);
    return ok(undefined);
  }
}
