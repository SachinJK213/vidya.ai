import { Module } from '@nestjs/common';
import { EMAIL_PROVIDER } from './providers/email/email.interface';
import { SMS_PROVIDER } from './providers/sms/sms.interface';
import { SmtpEmailProvider } from './providers/email/smtp.provider';
import { Msg91SmsProvider } from './providers/sms/msg91.provider';
import { ConfigService } from '@nestjs/config';

@Module({
  providers: [
    {
      provide: EMAIL_PROVIDER,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const provider = config.get<string>('EMAIL_PROVIDER', 'smtp');
        // sendgrid | ses providers added here as needed
        return new SmtpEmailProvider(config);
      },
    },
    {
      provide: SMS_PROVIDER,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const provider = config.get<string>('SMS_PROVIDER', 'disabled');
        if (provider === 'disabled') return null;
        return new Msg91SmsProvider(config);
      },
    },
  ],
  exports: [EMAIL_PROVIDER, SMS_PROVIDER],
})
export class NotificationsModule {}
