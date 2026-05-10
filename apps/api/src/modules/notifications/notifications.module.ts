import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ConfigService } from '@nestjs/config';
import { EMAIL_PROVIDER } from './providers/email/email.interface';
import { SMS_PROVIDER } from './providers/sms/sms.interface';
import { SmtpEmailProvider } from './providers/email/smtp.provider';
import { Msg91SmsProvider } from './providers/sms/msg91.provider';
import { DevSmsProvider } from './providers/sms/dev-sms.provider';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { NotificationProcessor } from './notification.processor';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [
    BullModule.registerQueue({ name: 'notifications' }),
    AiModule,
  ],
  providers: [
    {
      provide: EMAIL_PROVIDER,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        // mailhog / smtp both use the SmtpEmailProvider — only the host/port differ
        const provider = config.get<string>('EMAIL_PROVIDER', 'smtp');
        if (provider === 'disabled') return null;
        return new SmtpEmailProvider(config);
      },
    },
    {
      provide: SMS_PROVIDER,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const provider = config.get<string>('SMS_PROVIDER', 'disabled');
        if (provider === 'dev') return new DevSmsProvider();
        if (provider === 'disabled') return null;
        return new Msg91SmsProvider(config);
      },
    },
    NotificationService,
    NotificationProcessor,
    DevSmsProvider,
  ],
  controllers: [NotificationController],
  exports: [EMAIL_PROVIDER, SMS_PROVIDER, NotificationService, DevSmsProvider],
})
export class NotificationsModule {}
