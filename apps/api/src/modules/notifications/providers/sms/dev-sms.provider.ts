import { Injectable, Logger } from '@nestjs/common';
import { ISmsProvider, SendSmsOptions, SmsDeliveryResult } from './sms.interface';

export interface CapturedSms {
  id: string;
  to: string;
  message: string;
  senderId?: string;
  sentAt: Date;
}

// Process-scoped singleton inbox — survives hot-reloads, cleared on restart
export const devSmsInbox: CapturedSms[] = [];

@Injectable()
export class DevSmsProvider implements ISmsProvider {
  private readonly logger = new Logger(DevSmsProvider.name);

  async send(options: SendSmsOptions): Promise<SmsDeliveryResult> {
    const id = Math.random().toString(36).slice(2);
    const msg: CapturedSms = { id, to: options.to, message: options.message, senderId: options.senderId, sentAt: new Date() };
    devSmsInbox.push(msg);

    // Keep inbox to last 100 messages
    if (devSmsInbox.length > 100) devSmsInbox.shift();

    this.logger.log(`[DEV SMS] → ${options.to}: ${options.message}`);

    return { messageId: id, status: 'sent', provider: 'dev' };
  }

  async healthCheck(): Promise<boolean> {
    return true;
  }
}
