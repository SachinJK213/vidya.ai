export interface SendSmsOptions {
  to: string;
  message: string;
  dltTemplateId?: string; // mandatory for India DLT-registered templates
  senderId?: string;
}

export interface SmsDeliveryResult {
  messageId: string;
  status: 'queued' | 'sent' | 'failed';
  provider: string;
}

export interface ISmsProvider {
  send(options: SendSmsOptions): Promise<SmsDeliveryResult>;
  healthCheck(): Promise<boolean>;
}

export const SMS_PROVIDER = Symbol('SMS_PROVIDER');
