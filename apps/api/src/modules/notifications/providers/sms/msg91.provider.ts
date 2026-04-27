import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ISmsProvider, SendSmsOptions, SmsDeliveryResult } from './sms.interface';

// MSG91 — primary SMS provider for India (SaaS / MicroSaaS)
// On-prem: swap for KannelSmppProvider or HttpAggregatorProvider
@Injectable()
export class Msg91SmsProvider implements ISmsProvider {
  private readonly logger = new Logger(Msg91SmsProvider.name);
  private readonly baseUrl = 'https://api.msg91.com/api/v5';

  constructor(private config: ConfigService) {}

  async send(options: SendSmsOptions): Promise<SmsDeliveryResult> {
    const authKey = this.config.get<string>('MSG91_AUTH_KEY');
    const senderId = options.senderId ?? this.config.get<string>('MSG91_SENDER_ID', 'VIDYAI');

    const body = {
      sender: senderId,
      route: '4',
      country: '91',
      sms: [
        {
          message: options.message,
          to: [options.to.replace(/^\+91/, '')],
          ...(options.dltTemplateId && { template_id: options.dltTemplateId }),
        },
      ],
    };

    const res = await fetch(`${this.baseUrl}/sendSMS`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        authkey: authKey!,
      },
      body: JSON.stringify(body),
    });

    const data = await res.json() as any;

    if (data.type === 'error') {
      this.logger.error('MSG91 send failed', data);
      return { messageId: '', status: 'failed', provider: 'msg91' };
    }

    return { messageId: data.request_id ?? '', status: 'queued', provider: 'msg91' };
  }

  async healthCheck(): Promise<boolean> {
    return true;
  }
}
