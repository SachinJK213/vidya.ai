import { Controller, Get, Delete, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { devSmsInbox } from '../notifications/providers/sms/dev-sms.provider';

/**
 * Dev-only endpoints — only registered when NODE_ENV !== 'production'.
 * Provides visibility into captured emails (via MailHog UI) and captured SMS.
 */
@Controller('dev')
export class DevController {
  /** Returns captured SMS messages, newest first. ?limit=N to cap results (default 50). */
  @Get('sms')
  getSms(@Query('limit') limit = '50') {
    const n = Math.min(parseInt(limit, 10) || 50, 100);
    return {
      count: devSmsInbox.length,
      messages: [...devSmsInbox].reverse().slice(0, n),
      mailhogUi: 'http://localhost:8025',
    };
  }

  /** Clears the captured SMS inbox. */
  @Delete('sms')
  @HttpCode(HttpStatus.NO_CONTENT)
  clearSms() {
    devSmsInbox.splice(0, devSmsInbox.length);
  }
}
