import { Module } from '@nestjs/common';
import { RentsService } from './rents.service';
import { RentsController } from './rents.controller';
import { PrismaService } from 'src/prisma.service';
import { ScooterService } from 'src/scooters/scooter.service';
import { UserService } from 'src/users/user.service';

@Module({
  controllers: [RentsController],
  providers: [RentsService, PrismaService, ScooterService, UserService],
})
export class RentsModule {}
