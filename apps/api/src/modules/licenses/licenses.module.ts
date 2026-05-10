import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { LicensesService } from './licenses.service';
import { LicensesController } from './licenses.controller';
import { LicensesScheduler } from './licenses.scheduler';
import { PrismaModule } from '../../common/prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    BullModule.registerQueue({ name: 'notifications' }),
  ],
  providers: [LicensesService, LicensesScheduler],
  controllers: [LicensesController],
  exports: [LicensesService],
})
export class LicensesModule {}
