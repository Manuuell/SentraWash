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
  /** Key del objeto en S3 (referencia interna). */
  fotoKey!: string | null;
  /** URL prefirmada (temporal) para mostrar la foto; `null` si no hay foto. */
  fotoUrl!: string | null;
  items!: WorkOrderItemView[];
  subtotal!: number;
  descuento!: number;
  total!: number;
  fechaIngreso!: Date;
  fechaListo!: Date | null;
  fechaEntrega!: Date | null;
  createdAt!: Date;
  updatedAt!: Date;

  /** [fotoUrl] es la URL prefirmada de lectura, ya resuelta por el controlador. */
  static from(order: WorkOrder, fotoUrl: string | null = null): WorkOrderResponse {
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
      fotoKey: p.fotoKey,
      fotoUrl,
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
