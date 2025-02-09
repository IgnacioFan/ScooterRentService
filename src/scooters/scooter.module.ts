import { Module } from '@nestjs/common';
import { ScooterService } from './scooter.service';

@Module({
  providers: [ScooterService],
  exports: [ScooterService],
})
export class ScooterModule {}
