import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { LicensesService } from './licenses.service';

@Injectable()
export class LicensesScheduler {
  private readonly logger = new Logger(LicensesScheduler.name);

  constructor(private licensesService: LicensesService) {}

  @Cron('0 9 * * *', { name: 'license-expiry-check', timeZone: 'Asia/Kolkata' })
  async handleLicenseExpiryCheck() {
    this.logger.log('Running daily license expiry check…');
    await this.licensesService.runScheduledCheck();
    this.logger.log('License expiry check complete');
  }
}
