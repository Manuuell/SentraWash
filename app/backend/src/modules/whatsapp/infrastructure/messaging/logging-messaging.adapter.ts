import { Injectable, Logger } from '@nestjs/common';
import { MessagingPort, WhatsAppTemplate } from '../../domain/messaging.port';

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

  async sendTemplate(to: string, template: WhatsAppTemplate): Promise<void> {
    this.logger.log(
      `[WA SIMULADO template] -> ${to}: ${template.name}(${template.bodyParams.join(', ')})`,
    );
  }
}
