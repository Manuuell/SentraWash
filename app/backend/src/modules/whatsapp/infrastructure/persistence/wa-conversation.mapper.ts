import { WaConversation } from '../../domain/wa-conversation';
import { WaFlowState } from '../../domain/wa-flow-state';
import { WaConversationOrmEntity } from './wa-conversation.orm-entity';

export class WaConversationMapper {
  static toDomain(o: WaConversationOrmEntity): WaConversation {
    return WaConversation.rehydrate({
      id: o.id,
      tenantId: o.tenantId,
      customerId: o.customerId ?? null,
      telefono: o.telefono,
      estadoFlujo: o.estadoFlujo as WaFlowState,
      contexto: o.contexto ?? {},
      ultimaInteraccion: o.ultimaInteraccion,
      createdAt: o.createdAt,
      updatedAt: o.updatedAt,
    });
  }

  static toOrm(conversation: WaConversation): WaConversationOrmEntity {
    const p = conversation.toPrimitives();
    const o = new WaConversationOrmEntity();
    if (p.id) o.id = p.id;
    o.tenantId = p.tenantId;
    o.customerId = p.customerId;
    o.telefono = p.telefono;
    o.estadoFlujo = p.estadoFlujo;
    o.contexto = p.contexto;
    o.ultimaInteraccion = p.ultimaInteraccion;
    return o;
  }
}
