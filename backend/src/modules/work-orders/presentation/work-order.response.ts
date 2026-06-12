import { WorkOrder } from '../domain/work-order';

interface WorkOrderItemView {
  id: string | null;
  serviceId: string | null;
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export class WorkOrderResponse {
  id!: string;
  numeroOrden!: number;
  customerId!: string | null;
  vehicleId!: string | null;
  operarioId!: string | null;
  estado!: string;
  canalOrigen!: string;
  observaciones!: string | null;
  items!: WorkOrderItemView[];
  subtotal!: number;
  descuento!: number;
  total!: number;
  fechaIngreso!: Date;
  fechaListo!: Date | null;
  fechaEntrega!: Date | null;
  createdAt!: Date;
  updatedAt!: Date;

  static from(order: WorkOrder): WorkOrderResponse {
    const p = order.toPrimitives();
    return {
      id: p.id,
      numeroOrden: p.numeroOrden,
      customerId: p.customerId,
      vehicleId: p.vehicleId,
      operarioId: p.operarioId,
      estado: p.estado,
      canalOrigen: p.canalOrigen,
      observaciones: p.observaciones,
      items: p.items.map((i) => ({
        id: i.id,
        serviceId: i.serviceId,
        descripcion: i.descripcion,
        cantidad: i.cantidad,
        precioUnitario: i.precioUnitario,
        subtotal: i.subtotal,
      })),
      subtotal: p.subtotal,
      descuento: p.descuento,
      total: p.total,
      fechaIngreso: p.fechaIngreso,
      fechaListo: p.fechaListo,
      fechaEntrega: p.fechaEntrega,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    };
  }
}
