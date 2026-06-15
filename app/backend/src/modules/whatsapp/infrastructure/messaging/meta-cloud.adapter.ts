import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WhatsAppConfig } from '../../../../core/config/configuration';
import { MessagingPort, WhatsAppTemplate } from '../../domain/messaging.port';

/**
 * Adaptador oficial de Meta WhatsApp Cloud API (basado en el MetaCloudAdapter de
 * tooli-chatbot): POST a graph.facebook.com/{version}/{phoneNumberId}/messages.
 */
@Injectable()
export class MetaCloudAdapter implements MessagingPort {
  private readonly logger = new Logger(MetaCloudAdapter.name);

  constructor(private readonly config: ConfigService) {}

  async sendText(to: string, body: string, phoneNumberId?: string): Promise<void> {
    await this.post(phoneNumberId, { to, type: 'text', text: { body, preview_url: false } });
  }

  async sendTemplate(to: string, template: WhatsAppTemplate, phoneNumberId?: string): Promise<void> {
    const components =
      template.bodyParams.length > 0
        ? [
            {
              type: 'body',
              parameters: template.bodyParams.map((text) => ({ type: 'text', text })),
            },
          ]
        : [];
    await this.post(phoneNumberId, {
      to,
      type: 'template',
      template: {
        name: template.name,
        language: { code: template.language },
        components,
      },
    });
  }

  /** POST a la Graph API con el número emisor resuelto y manejo de error común. */
  private async post(phoneNumberId: string | undefined, message: Record<string, unknown>): Promise<void> {
    const cfg = this.config.get<WhatsAppConfig>('whatsapp')!;
    const pnid = phoneNumberId ?? cfg.phoneNumberId;
    if (!pnid) {
      throw new Error('No hay phone_number_id para enviar el mensaje de WhatsApp');
    }

    const url = `https://graph.facebook.com/${cfg.graphVersion}/${pnid}/messages`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${cfg.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ messaging_product: 'whatsapp', ...message }),
    });

    if (!res.ok) {
      const detail = await res.text();
      this.logger.error(`Error enviando WhatsApp (${res.status}): ${detail}`);
      throw new Error(`WhatsApp send failed: ${res.status}`);
    }
  }
}
