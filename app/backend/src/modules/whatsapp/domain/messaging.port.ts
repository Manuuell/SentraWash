/**
 * Mensaje de template (plantilla) pre-aprobado en Meta. Necesario para
 * notificaciones **proactivas** (fuera de la ventana de 24h, p. ej. "tu carro
 * está listo"), donde Meta no permite texto libre.
 */
export interface WhatsAppTemplate {
  /** Nombre del template aprobado en Meta (ej: 'vehiculo_listo'). */
  name: string;
  /** Código de idioma del template (ej: 'es', 'es_CO'). Debe coincidir con Meta. */
  language: string;
  /** Parámetros posicionales del cuerpo ({{1}}, {{2}}, ...). */
  bodyParams: string[];
}

/**
 * Puerto de mensajería (abstracción del proveedor de WhatsApp). Aísla la app del
 * proveedor concreto (Meta Cloud API, Evolution API, etc.), igual que el patrón de
 * adapters de tooli-chatbot. Permite cambiar de proveedor sin tocar la lógica.
 */
export interface MessagingPort {
  /**
   * Envía un texto (solo válido dentro de la ventana de 24h de Meta).
   * @param to número destino en E.164 (ej: 573001234567)
   * @param body cuerpo del mensaje
   * @param phoneNumberId número emisor (multi-tenant); si se omite usa el default.
   */
  sendText(to: string, body: string, phoneNumberId?: string): Promise<void>;

  /**
   * Envía un mensaje de template pre-aprobado (para notificaciones proactivas).
   * @param to número destino en E.164
   * @param template plantilla + parámetros
   * @param phoneNumberId número emisor; si se omite usa el default.
   */
  sendTemplate(to: string, template: WhatsAppTemplate, phoneNumberId?: string): Promise<void>;
}

export const MESSAGING_PORT = Symbol('MESSAGING_PORT');
