/** Estados de una orden de lavado (coincide con work_order_estado_enum). */
export enum WorkOrderStatus {
  RECIBIDO = 'recibido',
  EN_PROCESO = 'en_proceso',
  SECADO = 'secado',
  LISTO = 'listo',
  ENTREGADO = 'entregado',
  CANCELADO = 'cancelado',
}

/** Máquina de estados: transiciones válidas desde cada estado. */
export const WORK_ORDER_TRANSITIONS: Record<WorkOrderStatus, WorkOrderStatus[]> = {
  [WorkOrderStatus.RECIBIDO]: [WorkOrderStatus.EN_PROCESO, WorkOrderStatus.CANCELADO],
  [WorkOrderStatus.EN_PROCESO]: [WorkOrderStatus.SECADO, WorkOrderStatus.CANCELADO],
  [WorkOrderStatus.SECADO]: [WorkOrderStatus.LISTO, WorkOrderStatus.CANCELADO],
  [WorkOrderStatus.LISTO]: [WorkOrderStatus.ENTREGADO, WorkOrderStatus.CANCELADO],
  [WorkOrderStatus.ENTREGADO]: [],
  [WorkOrderStatus.CANCELADO]: [],
};
