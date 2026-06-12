import { WorkOrder } from './work-order';

/**
 * Puerto del repositorio de órdenes. Acotado al tenant activo por RLS.
 */
export interface WorkOrderRepository {
  findAll(): Promise<WorkOrder[]>;
  findById(id: string): Promise<WorkOrder | null>;
  /** Siguiente consecutivo de orden para el tenant actual. */
  nextNumeroOrden(): Promise<number>;
  save(order: WorkOrder): Promise<WorkOrder>;
  delete(id: string): Promise<void>;
}

export const WORK_ORDER_REPOSITORY = Symbol('WORK_ORDER_REPOSITORY');
