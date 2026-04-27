import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ConfigService } from '@nestjs/config';
import { EMAIL_PROVIDER } from './providers/email/email.interface';
import { SMS_PROVIDER } from './providers/sms/sms.interface';
import { SmtpEmailProvider } from './providers/email/smtp.provider';
import { Msg91SmsProvider } from './providers/sms/msg91.provider';
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
        const provider = config.get<string>('EMAIL_PROVIDER', 'smtp');
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
    NotificationService,
    NotificationProcessor,
  ],
  controllers: [NotificationController],
  exports: [EMAIL_PROVIDER, SMS_PROVIDER, NotificationService],
})
export class NotificationsModule {}
