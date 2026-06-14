import { Injectable, Logger } from '@nestjs/common';
import { MessagingPort } from '../../domain/messaging.port';

/**
 * Adaptador de desarrollo: SIMULA el envío escribiendo en el log. Se usa cuando
 * no hay WHATSAPP_ACCESS_TOKEN, para probar el flujo sin credenciales de Meta.
 */
@Injectable()
export class LoggingMessagingAdapter implements MessagingPort {
  private readonly logger = new Logger('WhatsApp');

  async sendText(to: string, body: string): Promise<void> {
    this.logger.log(`[WA SIMULADO] -> ${to}: ${body.replace(/\n/g, ' ⏎ ')}`);
  }
}
