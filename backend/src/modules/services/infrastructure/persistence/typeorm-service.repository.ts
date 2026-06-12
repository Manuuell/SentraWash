import { Injectable } from '@nestjs/common';
import { TenantManager } from '../../../../core/tenancy/tenant-manager.service';
import { Service } from '../../domain/service';
import { ServiceRepository } from '../../domain/service.repository';
import { ServiceMapper } from './service.mapper';
import { ServiceOrmEntity } from './service.orm-entity';

@Injectable()
export class TypeormServiceRepository implements ServiceRepository {
  constructor(private readonly tenant: TenantManager) {}

  private get repo() {
    return this.tenant.getRepository(ServiceOrmEntity);
  }

  async findAll(): Promise<Service[]> {
    const rows = await this.repo.find({ order: { nombre: 'ASC' } });
    return rows.map(ServiceMapper.toDomain);
  }

  async findById(id: string): Promise<Service | null> {
    const row = await this.repo.findOne({ where: { id } });
    return row ? ServiceMapper.toDomain(row) : null;
  }

  async save(service: Service): Promise<Service> {
    const saved = await this.repo.save(ServiceMapper.toOrm(service));
    return ServiceMapper.toDomain(saved);
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete({ id });
  }
}
