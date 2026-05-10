import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { IEmailProvider, SendEmailOptions, EmailDeliveryResult } from './email.interface';

// Used in: on-prem (Exchange, Postfix, Google Workspace SMTP relay), microsaas
@Injectable()
export class SmtpEmailProvider implements IEmailProvider {
  private readonly logger = new Logger(SmtpEmailProvider.name);
  private transporter: nodemailer.Transporter;

  constructor(private config: ConfigService) {
    const user = config.get<string>('SMTP_USER', '');
    const pass = config.get<string>('SMTP_PASS', '');
    this.transporter = nodemailer.createTransport({
      host: config.get<string>('SMTP_HOST', 'localhost'),
      port: Number(config.get('SMTP_PORT', 1025)),
      secure: config.get('SMTP_SECURE', 'false') === 'true',
      // skip auth block entirely when credentials are absent (e.g. MailHog)
      ...(user && pass ? { auth: { user, pass } } : {}),
    });
  }

  async send(options: SendEmailOptions): Promise<EmailDeliveryResult> {
    const info = await this.transporter.sendMail({
      from: options.from ?? this.config.get<string>('SMTP_FROM'),
      to: Array.isArray(options.to) ? options.to.join(',') : options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
      replyTo: options.replyTo,
      attachments: options.attachments,
    });

    return {
      messageId: info.messageId,
      accepted: info.accepted as string[],
      rejected: info.rejected as string[],
    };
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this.transporter.verify();
      return true;
    } catch (err) {
      this.logger.warn('SMTP health check failed', err);
      return false;
    }
  }
}
