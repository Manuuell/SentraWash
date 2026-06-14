import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  Inject,
  Logger,
  Post,
  Query,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Public } from '../../../core/auth/public.decorator';
import { WhatsAppConfig } from '../../../core/config/configuration';
import { SkipTenant } from '../../../core/tenancy/skip-tenant.decorator';
import { TenantScopeRunner } from '../../../core/tenancy/tenant-scope.runner';
import { ProcessInboundMessageUseCase } from '../application/process-inbound-message.use-case';
import { MESSAGING_PORT, MessagingPort } from '../domain/messaging.port';
import {
  WA_BUSINESS_ACCOUNT_REPOSITORY,
  WaBusinessAccountRepository,
} from '../domain/wa-business-account.repository';

interface WebhookMessage {
  from: string;
  type: string;
  text?: { body?: string };
}
interface WebhookValue {
  metadata?: { phone_number_id?: string };
  messages?: WebhookMessage[];
}
interface WebhookChange {
  value?: WebhookValue;
}
interface WebhookEntry {
  changes?: WebhookChange[];
}
interface WebhookPayload {
  entry?: WebhookEntry[];
}

/**
 * Webhook de WhatsApp Cloud API (Meta). Público y sin tenant por header: el
 * tenant se resuelve desde el phone_number_id receptor y la lógica del bot corre
 * dentro de un TenantScope (RLS).
 */
@Controller('whatsapp')
export class WhatsAppController {
  private readonly logger = new Logger(WhatsAppController.name);

  constructor(
    private readonly config: ConfigService,
    private readonly scope: TenantScopeRunner,
    private readonly bot: ProcessInboundMessageUseCase,
    @Inject(MESSAGING_PORT) private readonly messaging: MessagingPort,
    @Inject(WA_BUSINESS_ACCOUNT_REPOSITORY)
    private readonly businessAccounts: WaBusinessAccountRepository,
  ) {}

  /** Verificación del webhook (handshake de Meta). */
  @Get('webhook')
  @Public()
  @SkipTenant()
  verify(@Query() query: Record<string, string>): string {
    const cfg = this.config.get<WhatsAppConfig>('whatsapp')!;
    if (query['hub.mode'] === 'subscribe' && query['hub.verify_token'] === cfg.verifyToken) {
      return query['hub.challenge'];
    }
    throw new ForbiddenException('Verificación de webhook fallida');
  }

  /** Mensajes entrantes de los clientes. */
  @Post('webhook')
  @Public()
  @SkipTenant()
  @HttpCode(200)
  async inbound(@Body() payload: WebhookPayload): Promise<{ received: boolean }> {
    for (const entry of payload?.entry ?? []) {
      for (const change of entry.changes ?? []) {
        const value = change.value;
        const phoneNumberId = value?.metadata?.phone_number_id;
        const messages = value?.messages ?? [];
        if (!phoneNumberId || messages.length === 0) continue;

        const account = await this.businessAccounts.findByPhoneNumberId(phoneNumberId);
        if (!account) {
          this.logger.warn(`Mensaje sin tenant asociado (phone_number_id=${phoneNumberId})`);
          continue;
        }

        for (const msg of messages) {
          if (msg.type !== 'text' || !msg.text) continue;
          const from = msg.from;
          const text = msg.text.body ?? '';
          const replies = await this.scope.run(account.tenantId, () =>
            this.bot.handle(from, text),
          );
          for (const reply of replies) {
            await this.messaging.sendText(from, reply, phoneNumberId);
          }
        }
      }
    }
    return { received: true };
  }
}
