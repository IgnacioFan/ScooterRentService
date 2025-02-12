import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RentController } from './rent.controller';
import { RentService } from './rent.service';
import { ScooterService } from '../scooter/scooter.service';
import { UserService } from '../user/user.service';
import { PrismaService } from '../prisma.service';
// Register microservice module (RabbitMQ)
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ORDER_SERVICE } from '../constant/services';

@Module({
  imports: [
    ConfigModule,
    ClientsModule.registerAsync([
      {
        name: ORDER_SERVICE,
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [configService.get<string>('RABBITMQ_URL') || ''],
            queue: 'order_queue',
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  controllers: [RentController],
  providers: [RentService, PrismaService, ScooterService, UserService],
  exports: [RentService],
})
export class RentModule {}
