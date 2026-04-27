export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
  replyTo?: string;
  attachments?: Array<{ filename: string; content: Buffer; contentType: string }>;
}

export interface EmailDeliveryResult {
  messageId: string;
  accepted: string[];
  rejected: string[];
}

export interface IEmailProvider {
  send(options: SendEmailOptions): Promise<EmailDeliveryResult>;
  healthCheck(): Promise<boolean>;
}

export const EMAIL_PROVIDER = Symbol('EMAIL_PROVIDER');
