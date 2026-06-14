import { Injectable } from '@nestjs/common';
import { In } from 'typeorm';
import { TenantManager } from '../../../../core/tenancy/tenant-manager.service';
import { WorkOrder } from '../../domain/work-order';
import { WorkOrderRepository } from '../../domain/work-order.repository';
import { WorkOrderItemOrmEntity } from './work-order-item.orm-entity';
import { WorkOrderMapper } from './work-order.mapper';
import { WorkOrderOrmEntity } from './work-order.orm-entity';

/**
 * Adaptador TypeORM. La orden y sus ítems se persisten en la misma transacción
 * (la del interceptor multi-tenant), por lo que RLS y atomicidad están cubiertos.
 * Los ítems se reemplazan en cada save (son value objects del agregado).
 */
@Injectable()
export class TypeormWorkOrderRepository implements WorkOrderRepository {
  constructor(private readonly tenant: TenantManager) {}

  private get orders() {
    return this.tenant.getRepository(WorkOrderOrmEntity);
  }

  private get items() {
    return this.tenant.getRepository(WorkOrderItemOrmEntity);
  }

  async findAll(): Promise<WorkOrder[]> {
    const orders = await this.orders.find({ order: { numeroOrden: 'DESC' } });
    if (orders.length === 0) return [];
    const items = await this.items.find({ where: { workOrderId: In(orders.map((o) => o.id)) } });
    const byOrder = new Map<string, WorkOrderItemOrmEntity[]>();
    for (const item of items) {
      const list = byOrder.get(item.workOrderId) ?? [];
      list.push(item);
      byOrder.set(item.workOrderId, list);
    }
    return orders.map((o) => WorkOrderMapper.toDomain(o, byOrder.get(o.id) ?? []));
  }

  async findById(id: string): Promise<WorkOrder | null> {
    const order = await this.orders.findOne({ where: { id } });
    if (!order) return null;
    const items = await this.items.find({ where: { workOrderId: order.id } });
    return WorkOrderMapper.toDomain(order, items);
  }

  async nextNumeroOrden(): Promise<number> {
    const row = await this.orders
      .createQueryBuilder('wo')
      .select('COALESCE(MAX(wo.numero_orden), 0)', 'max')
      .getRawOne<{ max: string }>();
    return Number(row?.max ?? 0) + 1;
  }

  async save(order: WorkOrder): Promise<WorkOrder> {
    const savedOrder = await this.orders.save(WorkOrderMapper.toOrm(order));
    await this.items.delete({ workOrderId: savedOrder.id });
    const items = order
      .toPrimitives()
      .items.map((it) => WorkOrderMapper.itemToOrm(it, savedOrder.id, savedOrder.tenantId));
    if (items.length > 0) {
      await this.items.save(items);
    }
    return (await this.findById(savedOrder.id))!;
  }

  async delete(id: string): Promise<void> {
    // los ítems caen por ON DELETE CASCADE.
    await this.orders.delete({ id });
  }
}
