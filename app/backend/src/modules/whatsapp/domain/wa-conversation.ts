import { WaFlowState } from './wa-flow-state';

export interface WaConversationProps {
  id: string;
  tenantId: string;
  customerId: string | null;
  telefono: string;
  estadoFlujo: WaFlowState;
  contexto: Record<string, unknown>;
  ultimaInteraccion: Date;
  createdAt: Date;
  updatedAt: Date;
}

/** Conversación de WhatsApp con su estado de flujo y contexto (jsonb). */
export class WaConversation {
  private constructor(private props: WaConversationProps) {}

  static rehydrate(props: WaConversationProps): WaConversation {
    return new WaConversation(props);
  }

  static start(tenantId: string, telefono: string): WaConversation {
    const now = new Date();
    return new WaConversation({
      id: '',
      tenantId,
      customerId: null,
      telefono,
      estadoFlujo: WaFlowState.INICIO,
      contexto: {},
      ultimaInteraccion: now,
      createdAt: now,
      updatedAt: now,
    });
  }

  setState(state: WaFlowState): void {
    this.props.estadoFlujo = state;
    this.touch();
  }

  mergeContext(patch: Record<string, unknown>): void {
    this.props.contexto = { ...this.props.contexto, ...patch };
    this.touch();
  }

  setCustomerId(id: string): void {
    this.props.customerId = id;
    this.touch();
  }

  reset(): void {
    this.props.estadoFlujo = WaFlowState.INICIO;
    this.props.contexto = {};
    this.touch();
  }

  private touch(): void {
    const now = new Date();
    this.props.ultimaInteraccion = now;
    this.props.updatedAt = now;
  }

  toPrimitives(): WaConversationProps {
    return { ...this.props, contexto: { ...this.props.contexto } };
  }

  get id(): string {
    return this.props.id;
  }

  get estadoFlujo(): WaFlowState {
    return this.props.estadoFlujo;
  }

  get contexto(): Record<string, unknown> {
    return this.props.contexto;
  }

  get telefono(): string {
    return this.props.telefono;
  }
}
