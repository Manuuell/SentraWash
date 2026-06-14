import { Inject, Injectable } from '@nestjs/common';
import { ConflictError, DomainError } from '../../../../core/common/domain-error';
import { err, ok, Result } from '../../../../core/common/result';
import { UseCase } from '../../../../core/common/use-case';
import { TenantManager } from '../../../../core/tenancy/tenant-manager.service';
import { Vehicle } from '../../domain/vehicle';
import { VEHICLE_REPOSITORY, VehicleRepository } from '../../domain/vehicle.repository';
import { CreateVehicleDto } from '../dto/create-vehicle.dto';

@Injectable()
export class CreateVehicleUseCase implements UseCase<CreateVehicleDto, Vehicle> {
  constructor(
    @Inject(VEHICLE_REPOSITORY) private readonly vehicles: VehicleRepository,
    private readonly tenant: TenantManager,
  ) {}

  async execute(input: CreateVehicleDto): Promise<Result<Vehicle>> {
    let vehicle: Vehicle;
    try {
      vehicle = Vehicle.create(this.tenant.tenantId, {
        customerId: input.customerId ?? null,
        placa: input.placa,
        tipo: input.tipo,
        marca: input.marca ?? null,
        modelo: input.modelo ?? null,
        color: input.color ?? null,
        customFields: input.customFields ?? {},
      });
    } catch (error) {
      if (error instanceof DomainError) return err(error);
      throw error;
    }

    const existing = await this.vehicles.findByPlaca(vehicle.placa);
    if (existing) {
      return err(new ConflictError(`Ya existe un vehículo con placa ${vehicle.placa}`));
    }

    return ok(await this.vehicles.save(vehicle));
  }
}
