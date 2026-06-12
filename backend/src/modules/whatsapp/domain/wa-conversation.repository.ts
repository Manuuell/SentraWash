import { WaConversation } from './wa-conversation';

export interface WaConversationRepository {
  findByPhone(telefono: string): Promise<WaConversation | null>;
  save(conversation: WaConversation): Promise<WaConversation>;
}

export const WA_CONVERSATION_REPOSITORY = Symbol('WA_CONVERSATION_REPOSITORY');
