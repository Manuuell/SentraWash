/**
 * Puerto de mensajería (abstracción del proveedor de WhatsApp). Aísla la app del
 * proveedor concreto (Meta Cloud API, Evolution API, etc.), igual que el patrón de
 * adapters de tooli-chatbot. Permite cambiar de proveedor sin tocar la lógica.
 */
export interface MessagingPort {
  /**
   * Envía un texto.
   * @param to número destino en E.164 (ej: 573001234567)
   * @param body cuerpo del mensaje
   * @param phoneNumberId número emisor (multi-tenant); si se omite usa el default.
   */
  sendText(to: string, body: string, phoneNumberId?: string): Promise<void>;
}

export const MESSAGING_PORT = Symbol('MESSAGING_PORT');
