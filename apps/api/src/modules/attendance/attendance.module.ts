import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { AttendanceService } from './attendance.service';
import { AttendanceController } from './attendance.controller';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [
    BullModule.registerQueue({ name: 'notifications' }),
    AiModule,
  ],
  providers: [AttendanceService],
  controllers: [AttendanceController],
  exports: [AttendanceService],
})
export class AttendanceModule {}
