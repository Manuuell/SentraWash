import { Inject, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { DomainError, NotFoundError, ValidationError } from '../../../../core/common/domain-error';
import { err, ok, Result } from '../../../../core/common/result';
import { UseCase } from '../../../../core/common/use-case';
import { TenantManager } from '../../../../core/tenancy/tenant-manager.service';
import {
  VEHICLE_REPOSITORY,
  VehicleRepository,
} from '../../../vehicles/domain/vehicle.repository';
import {
  SERVICE_REPOSITORY,
  ServiceRepository,
} from '../../../services/domain/service.repository';
import { NewWorkOrderItem, WorkOrder } from '../../domain/work-order';
import { WorkOrderChannel } from '../../domain/work-order-channel';
import {
  WORK_ORDER_CREATED_EVENT,
  WorkOrderCreatedEvent,
} from '../../domain/work-order-created.event';
import { WORK_ORDER_REPOSITORY, WorkOrderRepository } from '../../domain/work-order.repository';
import { CreateWorkOrderDto } from '../dto/create-work-order.dto';

/** Etiqueta legible del tipo de vehículo para los mensajes al cliente. */
const TIPO_LABEL: Record<string, string> = {
  automovil: 'Automóvil',
  camioneta: 'Camioneta',
  moto: 'Moto',
  taxi: 'Taxi',
  camion: 'Camión',
  otro: 'Otro',
};

/**
 * Crea una orden de lavado. Orquesta varios agregados (capa de aplicación):
 *  - valida que el vehículo exista,
 *  - resuelve precio/nombre de cada servicio desde el catálogo (precio congelado),
 *  - asigna el consecutivo de orden y delega los cálculos al dominio.
 */
@Injectable()
export class CreateWorkOrderUseCase implements UseCase<CreateWorkOrderDto, WorkOrder> {
  constructor(
    @Inject(WORK_ORDER_REPOSITORY) private readonly orders: WorkOrderRepository,
    @Inject(VEHICLE_REPOSITORY) private readonly vehicles: VehicleRepository,
    @Inject(SERVICE_REPOSITORY) private readonly services: ServiceRepository,
    private readonly tenant: TenantManager,
    private readonly events: EventEmitter2,
  ) {}

  async execute(input: CreateWorkOrderDto): Promise<Result<WorkOrder>> {
    const vehicle = await this.vehicles.findById(input.vehicleId);
    if (!vehicle) {
      return err(new NotFoundError(`Vehículo ${input.vehicleId} no encontrado`));
    }

    const items: NewWorkOrderItem[] = [];
    for (const it of input.items) {
      if (it.serviceId) {
        const service = await this.services.findById(it.serviceId);
        if (!service) {
          return err(new NotFoundError(`Servicio ${it.serviceId} no encontrado`));
        }
        const sp = service.toPrimitives();
        items.push({
          serviceId: sp.id,
          descripcion: it.descripcion ?? sp.nombre,
          cantidad: it.cantidad ?? 1,
          precioUnitario: it.precioUnitario ?? sp.precio,
        });
      } else {
        if (!it.descripcion || it.precioUnitario == null) {
          return err(
            new ValidationError('Cada ítem sin servicio requiere descripción y precioUnitario'),
          );
        }
        items.push({
          serviceId: null,
          descripcion: it.descripcion,
          cantidad: it.cantidad ?? 1,
          precioUnitario: it.precioUnitario,
        });
      }
    }

    const numeroOrden = await this.orders.nextNumeroOrden();
    let order: WorkOrder;
    try {
      order = WorkOrder.create(this.tenant.tenantId, {
        numeroOrden,
        vehicleId: input.vehicleId,
        customerId: input.customerId ?? null,
        operarioId: input.operarioId ?? null,
        canalOrigen: input.canalOrigen ?? WorkOrderChannel.MOSTRADOR,
        observaciones: input.observaciones ?? null,
        fotoKey: input.fotoKey ?? null,
        descuento: input.descuento ?? 0,
        items,
      });
    } catch (error) {
      if (error instanceof DomainError) return err(error);
      throw error;
    }

    const saved = await this.orders.save(order);

    // Notificación de confirmación al cliente (async, desacoplado).
    const p = saved.toPrimitives();
    const v = vehicle.toPrimitives();
    this.events.emit(WORK_ORDER_CREATED_EVENT, {
      tenantId: p.tenantId,
      orderId: p.id,
      numeroOrden: p.numeroOrden,
      customerId: p.customerId,
      placa: v.placa,
      tipoVehiculo: TIPO_LABEL[v.tipo] ?? v.tipo,
    } satisfies WorkOrderCreatedEvent);

    return ok(saved);
  }
}
