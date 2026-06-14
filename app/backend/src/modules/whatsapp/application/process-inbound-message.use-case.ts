import { Inject, Injectable } from '@nestjs/common';
import { TenantManager } from '../../../core/tenancy/tenant-manager.service';
import { Customer } from '../../customers/domain/customer';
import {
  CUSTOMER_REPOSITORY,
  CustomerRepository,
} from '../../customers/domain/customer.repository';
import { Vehicle } from '../../vehicles/domain/vehicle';
import { VehicleType } from '../../vehicles/domain/vehicle-type';
import {
  VEHICLE_REPOSITORY,
  VehicleRepository,
} from '../../vehicles/domain/vehicle.repository';
import {
  SERVICE_REPOSITORY,
  ServiceRepository,
} from '../../services/domain/service.repository';
import { WorkOrder } from '../../work-orders/domain/work-order';
import { WorkOrderChannel } from '../../work-orders/domain/work-order-channel';
import {
  WORK_ORDER_REPOSITORY,
  WorkOrderRepository,
} from '../../work-orders/domain/work-order.repository';
import { WaConversation } from '../domain/wa-conversation';
import {
  WA_CONVERSATION_REPOSITORY,
  WaConversationRepository,
} from '../domain/wa-conversation.repository';
import { WaFlowState } from '../domain/wa-flow-state';

interface ServiceSnapshot {
  id: string;
  nombre: string;
  precio: number;
}

const PLACA_REGEX = /^([A-Z]{3}\d{3}|[A-Z]{3}\d{2}[A-Z]|\d{3}[A-Z]{3})$/;

const TIPOS: Record<string, VehicleType> = {
  '1': VehicleType.AUTOMOVIL,
  '2': VehicleType.CAMIONETA,
  '3': VehicleType.MOTO,
  '4': VehicleType.TAXI,
  '5': VehicleType.CAMION,
};

const cop = (n: number): string => `$${Math.round(n).toLocaleString('es-CO')}`;

/**
 * Máquina de estados del bot de WhatsApp. Recibe el texto del cliente, avanza el
 * flujo conversacional y, al confirmar, crea la orden (cliente + vehículo + orden
 * en canal WhatsApp). Devuelve los mensajes de respuesta a enviar.
 *
 * Se ejecuta SIEMPRE dentro de un TenantScope (el webhook lo envuelve), por lo que
 * los repositorios quedan acotados al tenant por RLS.
 */
@Injectable()
export class ProcessInboundMessageUseCase {
  constructor(
    @Inject(WA_CONVERSATION_REPOSITORY) private readonly conversations: WaConversationRepository,
    @Inject(SERVICE_REPOSITORY) private readonly services: ServiceRepository,
    @Inject(CUSTOMER_REPOSITORY) private readonly customers: CustomerRepository,
    @Inject(VEHICLE_REPOSITORY) private readonly vehicles: VehicleRepository,
    @Inject(WORK_ORDER_REPOSITORY) private readonly orders: WorkOrderRepository,
    private readonly tenant: TenantManager,
  ) {}

  async handle(telefono: string, rawText: string): Promise<string[]> {
    const text = rawText.trim();
    const lower = text.toLowerCase();

    const conversation =
      (await this.conversations.findByPhone(telefono)) ??
      WaConversation.start(this.tenant.tenantId, telefono);

    if (lower === 'cancelar' || lower === 'salir') {
      conversation.reset();
      await this.conversations.save(conversation);
      return ['Listo, cancelé el proceso. Escribe *hola* cuando quieras agendar un lavado. 👋'];
    }

    switch (conversation.estadoFlujo) {
      case WaFlowState.INICIO:
        return this.handleInicio(conversation);
      case WaFlowState.ESPERANDO_SERVICIO:
        return this.handleServicio(conversation, text);
      case WaFlowState.ESPERANDO_PLACA:
        return this.handlePlaca(conversation, text);
      case WaFlowState.ESPERANDO_TIPO:
        return this.handleTipo(conversation, text);
      case WaFlowState.CONFIRMACION:
        return this.handleConfirmacion(conversation, lower);
      default:
        conversation.reset();
        await this.conversations.save(conversation);
        return ['Reinicié la conversación. Escribe *hola* para empezar. 👋'];
    }
  }

  private async handleInicio(conversation: WaConversation): Promise<string[]> {
    const services = (await this.services.findAll())
        .map((s) => s.toPrimitives())
        .filter((s) => s.activo)
        .map<ServiceSnapshot>((s) => ({ id: s.id, nombre: s.nombre, precio: s.precio }));

    if (services.length === 0) {
      return ['Por ahora este lavadero no tiene servicios disponibles. Intenta más tarde. 🙏'];
    }

    conversation.mergeContext({ services });
    conversation.setState(WaFlowState.ESPERANDO_SERVICIO);
    await this.conversations.save(conversation);

    const menu = services
      .map((s, i) => `${i + 1}. ${s.nombre} — ${cop(s.precio)}`)
      .join('\n');
    return [
      `¡Hola! 👋 Bienvenido a *SentraWash*. Soy tu asistente para agendar tu lavado.\n\n` +
        `¿Qué servicio deseas?\n\n${menu}\n\nResponde con el *número* del servicio.`,
    ];
  }

  private async handleServicio(conversation: WaConversation, text: string): Promise<string[]> {
    const services = (conversation.contexto['services'] as ServiceSnapshot[]) ?? [];
    const index = parseInt(text, 10) - 1;
    const selected = services[index];
    if (!selected) {
      return [`No entendí. Responde con el número del servicio (1 a ${services.length}).`];
    }

    conversation.mergeContext({
      serviceId: selected.id,
      serviceNombre: selected.nombre,
      servicePrecio: selected.precio,
    });
    conversation.setState(WaFlowState.ESPERANDO_PLACA);
    await this.conversations.save(conversation);

    return [
      `Elegiste *${selected.nombre}* (${cop(selected.precio)}). ✅\n\n` +
        `Ahora dime la *placa* del vehículo (ej: ABC123).`,
    ];
  }

  private async handlePlaca(conversation: WaConversation, text: string): Promise<string[]> {
    const placa = text.toUpperCase().replace(/[\s-]/g, '');
    if (!PLACA_REGEX.test(placa)) {
      return ['❌ Esa placa no parece válida. Envíala de nuevo (ej: ABC123 o ABC12D).'];
    }

    conversation.mergeContext({ placa });
    conversation.setState(WaFlowState.ESPERANDO_TIPO);
    await this.conversations.save(conversation);

    return [
      `Placa *${placa}* anotada. 🚗\n\n¿Qué tipo de vehículo es?\n` +
        `1. Automóvil\n2. Camioneta\n3. Moto\n4. Taxi\n5. Camión\n\nResponde con el número.`,
    ];
  }

  private async handleTipo(conversation: WaConversation, text: string): Promise<string[]> {
    const tipo = TIPOS[text.trim()];
    if (!tipo) {
      return ['No entendí. Responde con un número del 1 al 5 para el tipo de vehículo.'];
    }

    conversation.mergeContext({ tipo });
    conversation.setState(WaFlowState.CONFIRMACION);
    await this.conversations.save(conversation);

    const ctx = conversation.contexto;
    return [
      `Confirmemos tu orden:\n\n` +
        `🧽 Servicio: *${ctx['serviceNombre']}*\n` +
        `🚗 Vehículo: *${ctx['placa']}* (${tipo})\n` +
        `💵 Total: *${cop(Number(ctx['servicePrecio']))}*\n\n` +
        `¿Confirmas? Responde *SÍ* o *NO*.`,
    ];
  }

  private async handleConfirmacion(
    conversation: WaConversation,
    lower: string,
  ): Promise<string[]> {
    const si = ['si', 'sí', 'confirmar', 'ok', 'dale'];
    const no = ['no', 'cancelar'];
    if (no.includes(lower)) {
      conversation.reset();
      await this.conversations.save(conversation);
      return ['Sin problema, cancelé la orden. Escribe *hola* para empezar de nuevo. 👋'];
    }
    if (!si.includes(lower)) {
      return ['Responde *SÍ* para confirmar o *NO* para cancelar.'];
    }

    const ctx = conversation.contexto;
    const tenantId = this.tenant.tenantId;
    const telefono = conversation.telefono;

    // 1) Cliente (buscar por teléfono o crear)
    let customer = await this.customers.findByTelefono(telefono);
    if (!customer) {
      customer = await this.customers.save(
        Customer.create(tenantId, {
          nombre: 'Cliente WhatsApp',
          telefono,
          email: null,
          documento: null,
        }),
      );
    }

    // 2) Vehículo (buscar por placa o crear)
    const placa = String(ctx['placa']);
    let vehicle = await this.vehicles.findByPlaca(placa);
    if (!vehicle) {
      vehicle = await this.vehicles.save(
        Vehicle.create(tenantId, {
          customerId: customer.id,
          placa,
          tipo: ctx['tipo'] as VehicleType,
          marca: null,
          modelo: null,
          color: null,
          customFields: {},
        }),
      );
    }

    // 3) Orden de lavado (canal WhatsApp)
    const numeroOrden = await this.orders.nextNumeroOrden();
    const order = WorkOrder.create(tenantId, {
      numeroOrden,
      vehicleId: vehicle.id,
      customerId: customer.id,
      operarioId: null,
      canalOrigen: WorkOrderChannel.WHATSAPP,
      observaciones: 'Orden creada por el bot de WhatsApp',
      descuento: 0,
      items: [
        {
          serviceId: String(ctx['serviceId']),
          descripcion: String(ctx['serviceNombre']),
          cantidad: 1,
          precioUnitario: Number(ctx['servicePrecio']),
        },
      ],
    });
    const saved = await this.orders.save(order);
    const savedProps = saved.toPrimitives();

    conversation.setCustomerId(customer.id);
    conversation.reset();
    await this.conversations.save(conversation);

    return [
      `✅ ¡Listo! Tu orden *#${savedProps.numeroOrden}* fue creada.\n\n` +
        `🚗 ${placa} · 🧽 ${ctx['serviceNombre']}\n` +
        `💵 Total: *${cop(savedProps.total)}*\n\n` +
        `Te avisaremos por aquí cuando tu vehículo esté listo. ¡Gracias! 🙌`,
    ];
  }
}
