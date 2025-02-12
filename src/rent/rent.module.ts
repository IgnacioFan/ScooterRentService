import { Module } from '@nestjs/common';
import { RentController } from './rent.controller';
import { RentService } from './rent.service';
import { ScooterService } from '../scooter/scooter.service';
import { UserService } from '../user/user.service';

import { PrismaService } from '../prisma.service';
// register microservice module (RabbitMQ)
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ORDER_SERVICE } from '../constant/services';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: ORDER_SERVICE,
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://rabbitmq:5672'],
          queue: 'order_queue',
        },
      },
    ]),
  ],
  controllers: [RentController],
  providers: [RentService, PrismaService, ScooterService, UserService],
  exports: [RentService],
})
export class RentModule {}
