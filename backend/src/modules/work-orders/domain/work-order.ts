import { ValidationError } from '../../../core/common/domain-error';
import { WorkOrderChannel } from './work-order-channel';
import { WorkOrderItemProps } from './work-order-item';
import { WORK_ORDER_TRANSITIONS, WorkOrderStatus } from './work-order-status';

export interface WorkOrderProps {
  id: string;
  tenantId: string;
  numeroOrden: number;
  customerId: string | null;
  vehicleId: string | null;
  operarioId: string | null;
  estado: WorkOrderStatus;
  canalOrigen: WorkOrderChannel;
  observaciones: string | null;
  items: WorkOrderItemProps[];
  subtotal: number;
  descuento: number;
  total: number;
  fechaIngreso: Date;
  fechaListo: Date | null;
  fechaEntrega: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface NewWorkOrderItem {
  serviceId: string | null;
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
}

export interface NewWorkOrder {
  numeroOrden: number;
  vehicleId: string | null;
  customerId: string | null;
  operarioId: string | null;
  canalOrigen: WorkOrderChannel;
  observaciones: string | null;
  descuento: number;
  items: NewWorkOrderItem[];
}

const round2 = (n: number): number => Math.round((n + Number.EPSILON) * 100) / 100;

/**
 * Aggregate root Orden de lavado. Encapsula:
 *  - el detalle (items) y el cálculo de subtotal/descuento/total,
 *  - la máquina de estados (recibido → en_proceso → listo → entregado | cancelado),
 *  - los timestamps de cada hito (ingreso, listo, entrega).
 * Independiente de framework/persistencia.
 */
export class WorkOrder {
  private constructor(private props: WorkOrderProps) {}

  static rehydrate(props: WorkOrderProps): WorkOrder {
    return new WorkOrder(props);
  }

  static create(tenantId: string, input: NewWorkOrder): WorkOrder {
    if (!input.vehicleId) {
      throw new ValidationError('La orden requiere un vehículo');
    }
    if (!input.items || input.items.length === 0) {
      throw new ValidationError('La orden requiere al menos un servicio');
    }

    const items: WorkOrderItemProps[] = input.items.map((it) => {
      if (it.cantidad <= 0) throw new ValidationError('La cantidad debe ser mayor a 0');
      if (it.precioUnitario < 0) throw new ValidationError('El precio unitario no puede ser negativo');
      return {
        id: null,
        serviceId: it.serviceId,
        descripcion: it.descripcion,
        cantidad: it.cantidad,
        precioUnitario: it.precioUnitario,
        subtotal: round2(it.cantidad * it.precioUnitario),
      };
    });

    const subtotal = round2(items.reduce((sum, it) => sum + it.subtotal, 0));
    const descuento = input.descuento ?? 0;
    if (descuento < 0) throw new ValidationError('El descuento no puede ser negativo');
    if (descuento > subtotal) throw new ValidationError('El descuento no puede superar el subtotal');

    const now = new Date();
    return new WorkOrder({
      id: '',
      tenantId,
      numeroOrden: input.numeroOrden,
      customerId: input.customerId ?? null,
      vehicleId: input.vehicleId,
      operarioId: input.operarioId ?? null,
      estado: WorkOrderStatus.RECIBIDO,
      canalOrigen: input.canalOrigen ?? WorkOrderChannel.MOSTRADOR,
      observaciones: input.observaciones ?? null,
      items,
      subtotal,
      descuento,
      total: round2(subtotal - descuento),
      fechaIngreso: now,
      fechaListo: null,
      fechaEntrega: null,
      createdAt: now,
      updatedAt: now,
    });
  }

  /** Aplica una transición de estado validándola contra la máquina de estados. */
  changeStatus(next: WorkOrderStatus): void {
    const allowed = WORK_ORDER_TRANSITIONS[this.props.estado];
    if (!allowed.includes(next)) {
      throw new ValidationError(`Transición no permitida: ${this.props.estado} → ${next}`);
    }
    this.props.estado = next;
    const now = new Date();
    if (next === WorkOrderStatus.LISTO && !this.props.fechaListo) this.props.fechaListo = now;
    if (next === WorkOrderStatus.ENTREGADO && !this.props.fechaEntrega) this.props.fechaEntrega = now;
    this.props.updatedAt = now;
  }

  toPrimitives(): WorkOrderProps {
    return { ...this.props, items: this.props.items.map((i) => ({ ...i })) };
  }

  get id(): string {
    return this.props.id;
  }

  get estado(): WorkOrderStatus {
    return this.props.estado;
  }
}
