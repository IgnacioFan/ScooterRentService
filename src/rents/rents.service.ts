import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Rent, Prisma } from '@prisma/client';
import { CreateRentDto } from './dto/create-rent.dto';
import { EndRentDto } from './dto/end-rent.dto';
import { PayRentDto } from './dto/pay-rent.dto';
import { ScooterService } from './../scooters/scooter.service';
import { UserService } from 'src/users/user.service';

@Injectable()
export class RentsService {
  constructor(
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

  end(id: number, endRentDto: EndRentDto) {
    return `This action updates a #${id} rent`;
  }

  pay(id: number, payRentDto: PayRentDto) {
    return `This action updates a #${id} rent`;
  }
}
