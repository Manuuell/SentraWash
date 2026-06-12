import { Injectable } from '@nestjs/common';
import { TenantManager } from '../../../../core/tenancy/tenant-manager.service';
import { Customer } from '../../domain/customer';
import { CustomerRepository } from '../../domain/customer.repository';
import { CustomerMapper } from './customer.mapper';
import { CustomerOrmEntity } from './customer.orm-entity';

@Injectable()
export class TypeormCustomerRepository implements CustomerRepository {
  constructor(private readonly tenant: TenantManager) {}

  private get repo() {
    return this.tenant.getRepository(CustomerOrmEntity);
  }

  async findAll(): Promise<Customer[]> {
    const rows = await this.repo.find({ order: { createdAt: 'DESC' } });
    return rows.map(CustomerMapper.toDomain);
  }

  async findById(id: string): Promise<Customer | null> {
    const row = await this.repo.findOne({ where: { id } });
    return row ? CustomerMapper.toDomain(row) : null;
  }

  async findByTelefono(telefono: string): Promise<Customer | null> {
    const row = await this.repo.findOne({ where: { telefono } });
    return row ? CustomerMapper.toDomain(row) : null;
  }

  async save(customer: Customer): Promise<Customer> {
    const saved = await this.repo.save(CustomerMapper.toOrm(customer));
    return CustomerMapper.toDomain(saved);
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete({ id });
  }
}
