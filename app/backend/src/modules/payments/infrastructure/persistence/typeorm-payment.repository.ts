import { Injectable } from '@nestjs/common';
import { TenantManager } from '../../../../core/tenancy/tenant-manager.service';
import { Payment } from '../../domain/payment';
import { PaymentRepository } from '../../domain/payment.repository';
import { PaymentMapper } from './payment.mapper';
import { PaymentOrmEntity } from './payment.orm-entity';

@Injectable()
export class TypeormPaymentRepository implements PaymentRepository {
  constructor(private readonly tenant: TenantManager) {}

  private get repo() {
    return this.tenant.getRepository(PaymentOrmEntity);
  }

  async findAll(): Promise<Payment[]> {
    const rows = await this.repo.find({ order: { fechaPago: 'DESC' } });
    return rows.map(PaymentMapper.toDomain);
  }

  async findById(id: string): Promise<Payment | null> {
    const row = await this.repo.findOne({ where: { id } });
    return row ? PaymentMapper.toDomain(row) : null;
  }

  async findByWorkOrder(workOrderId: string): Promise<Payment[]> {
    const rows = await this.repo.find({ where: { workOrderId }, order: { fechaPago: 'DESC' } });
    return rows.map(PaymentMapper.toDomain);
  }

  async save(payment: Payment): Promise<Payment> {
    const saved = await this.repo.save(PaymentMapper.toOrm(payment));
    return PaymentMapper.toDomain(saved);
  }
}
