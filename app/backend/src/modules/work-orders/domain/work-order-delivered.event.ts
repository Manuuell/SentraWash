/**
 * Evento de dominio: una orden se entregó. Lo emite el cambio de estado y lo
 * consume notificaciones para mandar el recibo por WhatsApp al cliente.
 */
export const WORK_ORDER_DELIVERED_EVENT = 'work_order.delivered';

export interface WorkOrderDeliveredEvent {
  tenantId: string;
  orderId: string;
  numeroOrden: number;
  customerId: string | null;
  /** Servicios concatenados para el recibo (ej: "Lavado básico, Encerado x2"). */
  servicios: string;
  /** Total formateado (ej: "$35.000"). */
  total: string;
}
