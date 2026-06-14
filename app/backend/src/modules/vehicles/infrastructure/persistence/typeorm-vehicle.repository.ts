import { Injectable } from '@nestjs/common';
import { TenantManager } from '../../../../core/tenancy/tenant-manager.service';
import { Vehicle } from '../../domain/vehicle';
import { VehicleRepository } from '../../domain/vehicle.repository';
import { VehicleMapper } from './vehicle.mapper';
import { VehicleOrmEntity } from './vehicle.orm-entity';

/**
 * Implementación TypeORM del puerto VehicleRepository. Obtiene el repositorio
 * desde el TenantManager → opera sobre la conexión transaccional donde
 * `app.current_tenant` está fijado, por lo que RLS acota automáticamente al tenant.
 */
@Injectable()
export class TypeormVehicleRepository implements VehicleRepository {
  constructor(private readonly tenant: TenantManager) {}

  private get repo() {
    return this.tenant.getRepository(VehicleOrmEntity);
  }

  async findAll(): Promise<Vehicle[]> {
    const rows = await this.repo.find({ order: { createdAt: 'DESC' } });
    return rows.map(VehicleMapper.toDomain);
  }

  async findById(id: string): Promise<Vehicle | null> {
    const row = await this.repo.findOne({ where: { id } });
    return row ? VehicleMapper.toDomain(row) : null;
  }

  async findByPlaca(placa: string): Promise<Vehicle | null> {
    const row = await this.repo.findOne({ where: { placa } });
    return row ? VehicleMapper.toDomain(row) : null;
  }

  async save(vehicle: Vehicle): Promise<Vehicle> {
    const saved = await this.repo.save(VehicleMapper.toOrm(vehicle));
    return VehicleMapper.toDomain(saved);
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete({ id });
  }
}
