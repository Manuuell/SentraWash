/**
 * Evento de dominio: una orden pasó a "listo". Lo emite el cambio de estado y lo
 * consume el módulo de notificaciones (desacople análogo a EventBridge → SQS).
 */
export const WORK_ORDER_READY_EVENT = 'work_order.ready';

export interface WorkOrderReadyEvent {
  tenantId: string;
  orderId: string;
  numeroOrden: number;
  customerId: string | null;
}
