import { WorkOrder } from '../../domain/work-order';
import { WorkOrderItemProps } from '../../domain/work-order-item';
import { WorkOrderItemOrmEntity } from './work-order-item.orm-entity';
import { WorkOrderOrmEntity } from './work-order.orm-entity';

export class WorkOrderMapper {
  static toDomain(order: WorkOrderOrmEntity, items: WorkOrderItemOrmEntity[]): WorkOrder {
    return WorkOrder.rehydrate({
      id: order.id,
      tenantId: order.tenantId,
      numeroOrden: order.numeroOrden,
      customerId: order.customerId ?? null,
      vehicleId: order.vehicleId ?? null,
      operarioId: order.operarioId ?? null,
      estado: order.estado,
      canalOrigen: order.canalOrigen,
      observaciones: order.observaciones ?? null,
      fotoKey: order.fotoKey ?? null,
      items: items.map((i) => ({
        id: i.id,
        serviceId: i.serviceId ?? null,
        descripcion: i.descripcion ?? '',
        cantidad: i.cantidad,
        precioUnitario: Number(i.precioUnitario),
        subtotal: Number(i.subtotal),
      })),
      subtotal: Number(order.subtotal),
      descuento: Number(order.descuento),
      total: Number(order.total),
      fechaIngreso: order.fechaIngreso,
      fechaListo: order.fechaListo ?? null,
      fechaEntrega: order.fechaEntrega ?? null,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    });
  }

  static toOrm(order: WorkOrder): WorkOrderOrmEntity {
    const p = order.toPrimitives();
    const o = new WorkOrderOrmEntity();
    if (p.id) o.id = p.id;
    o.tenantId = p.tenantId;
    o.numeroOrden = p.numeroOrden;
    o.customerId = p.customerId;
    o.vehicleId = p.vehicleId;
    o.operarioId = p.operarioId;
    o.estado = p.estado;
    o.canalOrigen = p.canalOrigen;
    o.observaciones = p.observaciones;
    o.fotoKey = p.fotoKey;
    o.subtotal = p.subtotal.toFixed(2);
    o.descuento = p.descuento.toFixed(2);
    o.total = p.total.toFixed(2);
    o.fechaIngreso = p.fechaIngreso;
    o.fechaListo = p.fechaListo;
    o.fechaEntrega = p.fechaEntrega;
    return o;
  }

  static itemToOrm(
    item: WorkOrderItemProps,
    workOrderId: string,
    tenantId: string,
  ): WorkOrderItemOrmEntity {
    const i = new WorkOrderItemOrmEntity();
    if (item.id) i.id = item.id;
    i.tenantId = tenantId;
    i.workOrderId = workOrderId;
    i.serviceId = item.serviceId;
    i.descripcion = item.descripcion;
    i.cantidad = item.cantidad;
    i.precioUnitario = item.precioUnitario.toFixed(2);
    i.subtotal = item.subtotal.toFixed(2);
    return i;
  }
}
