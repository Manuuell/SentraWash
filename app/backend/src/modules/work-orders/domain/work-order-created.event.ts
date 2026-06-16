/**
 * Evento de dominio: se registró una orden nueva. Lo emite la creación de orden y
 * lo consume notificaciones para mandar el WhatsApp de confirmación al cliente.
 */
export const WORK_ORDER_CREATED_EVENT = 'work_order.created';

export interface WorkOrderCreatedEvent {
  tenantId: string;
  orderId: string;
  numeroOrden: number;
  customerId: string | null;
  /** Placa del vehículo (ya resuelta al crear la orden). */
  placa: string;
  /** Tipo de vehículo legible (ej: "Automóvil"). */
  tipoVehiculo: string;
}
