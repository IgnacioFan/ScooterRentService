import {
  Inject,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { lastValueFrom } from 'rxjs';
import { PrismaService } from '../prisma.service';
import { Rent, Prisma } from '@prisma/client';
import { CreateRentDto } from './dto/create-rent.dto';
import { EndRentDto } from './dto/end-rent.dto';
import { PayRentDto } from './dto/pay-rent.dto';
import { ScooterService } from '../scooter/scooter.service';
import { UserService } from '../user/user.service';
// set up RabbitMQ client
import { ORDER_SERVICE } from '../constant/services';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class RentService {
  constructor(
    @Inject(ORDER_SERVICE) private readonly client: ClientProxy,
    private readonly prisma: PrismaService,
    private readonly scooterService: ScooterService,
    private readonly userService: UserService,
  ) {}

  async findFirstRent(
    rentWhereInput: Prisma.RentWhereInput,
  ): Promise<Rent | null> {
    return this.prisma.rent.findFirst({ where: rentWhereInput });
  }

  // async createRent(data: Prisma.RentCreateInput): Promise<Rent> {
  //   return this.prisma.rent.create({ data });
  // }

  async create(createRentDto: CreateRentDto) {
    const { scooterId, userId } = createRentDto;

    const scooter = await this.scooterService.findScooterBy({ id: scooterId });
    if (!scooter) {
      throw new NotFoundException('Scooter not found');
    }

    const user = await this.userService.findUserBy({ id: userId });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const existingRent = await this.findFirstRent({
      userId,
      endAt: null,
      status: { not: 'completed' },
    });

    if (existingRent?.endAt === null) {
      throw new BadRequestException(
        'User is renting',
      );
    }

    if (existingRent?.status !== 'completed') {
      throw new BadRequestException(
        'User has an unpaid rantal',
      );
    }

    const rent = await this.prisma.rent.create({
      data: {
        userId: user.id,
        scooterId: scooter.id,
        startAt: new Date(),
        status: 'pending',
      },
    });

    return {
      rentId: rent.id,
      rentStartAt: rent.startAt,
      rentStatus: rent.status,
      userName: user.name,
      scooterSerialNumber: scooter.serialNumber,
      scooterLicensePlate: scooter.licensePlate,
    };
  }

  async end(id: number, endRentDto: EndRentDto) {
    const { userId } = endRentDto

    const rent = await this.prisma.rent.findUnique({
      where: { id, userId },
      include: { user: true, scooter: true },
    });

    if (!rent) {
      throw new NotFoundException('Rent not found');
    }
    if (rent.endAt || rent.status === "completed") {
      throw new BadRequestException('Rent has already been completed.');
    }

    const startAt = new Date(rent.startAt);
    const endAt = new Date();
    const durationMinutes = Math.ceil((endAt.getTime() - startAt.getTime()) / (1000 * 60));
    const totalAmount = durationMinutes * 2;

    return await this.prisma.$transaction(async (prisma) => {
      const updatedRent = await prisma.rent.update({
        where: { id },
        data: {
          endAt: endAt
        },
      });

      await prisma.scooter.update({
        where: { id: rent.scooterId },
        data: { status: 'available' },
      });

      // send create_order message to WemoOrder through RabbitMQ
      this.client.emit('order_created', {
        rentId: id,
        userId,
        amount: totalAmount,
        currency: 'TWD',
      });

      return {
        rentStartAt: updatedRent.startAt,
        rentEndAt: endAt,
        rentStatus: updatedRent.status,
        rentTotalAmount: totalAmount,
        userName: rent.user.name,
        scooterSerialNumber: rent.scooter.serialNumber,
        scooterLicensePlate: rent.scooter.licensePlate,
      };
    });
  }

  async pay(id: number, payRentDto: PayRentDto) {
    const { userId } = payRentDto
    const rent = await this.prisma.rent.findUnique({
      where: { id, userId },
      include: { user: true, scooter: true },
    });

    if (!rent) {
      throw new NotFoundException('Rent not found');
    }
    if (rent.endAt && rent.status === "completed") {
      throw new BadRequestException('Rent has already been completed.');
    }

    return await this.prisma.$transaction(async (prisma) => {
      const response = await lastValueFrom(
        this.client.send('order_paid', {
          rentId: rent.id,
          userId,
        })
      );

      if (response.status !== 'success') {
        throw new BadRequestException('Payment failed');
      }

      const updatedRent = await prisma.rent.update({
        where: { id: rent.id },
        data: { status: 'paid' },
      });

      return {
        rentStartAt: updatedRent.startAt,
        rentEndAt: updatedRent.endAt,
        rentStatus: updatedRent.status,
        userName: rent.user.name,
        scooterSerialNumber: rent.scooter.serialNumber,
        scooterLicensePlate: rent.scooter.licensePlate,
        order: response.order,
      };
    });
  }
}
