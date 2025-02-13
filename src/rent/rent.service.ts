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
import { RENT_STATUS, ERROR_MESSAGES } from '../constant/rent.constatns';
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

  async create(createRentDto: CreateRentDto): Promise<Rent> {
    const { scooterId, userId } = createRentDto;

    const scooter = await this.scooterService.findScooterBy({ id: scooterId });
    if (!scooter) throw new NotFoundException(ERROR_MESSAGES.SCOOTER_NOT_FOUND);
    if (scooter.status !== 'available') {
      throw new BadRequestException(
        ERROR_MESSAGES.SCOOTER_NOT_AVAILABLE(scooterId),
      );
    }

    const user = await this.userService.findUserBy({ id: userId });
    if (!user) throw new NotFoundException(ERROR_MESSAGES.USER_NOT_FOUND);

    const isUncompleted = await this.isUserHasUncompletedRentals(userId);
    if (isUncompleted)
      throw new BadRequestException(ERROR_MESSAGES.UNCOMPLETED_RENT(userId));

    return this.prisma.$transaction(async () => {
      const rent = await this.createNewRent(user.id, scooter.id);
      await this.scooterService.updateScooterBy(scooterId, {
        status: 'rented',
      });
      return rent;
    });
  }

  async end(id: number, endRentDto: EndRentDto) {
    const { userId } = endRentDto;

    const rent = await this.findRentBy({ id, userId });
    if (!rent) throw new NotFoundException(ERROR_MESSAGES.RENT_NOT_FOUND);
    if (rent.endAt && rent.status == RENT_STATUS.PENDING)
      throw new BadRequestException(ERROR_MESSAGES.UNCOMPLETED_RENT(userId));
    if (rent.endAt && rent.status === RENT_STATUS.COMPLETED)
      throw new BadRequestException(ERROR_MESSAGES.RENT_COMPLETED);

    const startAt = new Date(rent.startAt);
    const endAt = new Date();
    const durationMinutes = Math.ceil(
      (endAt.getTime() - startAt.getTime()) / (1000 * 60),
    );
    const totalAmount = durationMinutes * 2;

    return this.prisma.$transaction(async () => {
      await this.scooterService.updateScooterBy(rent.scooterId, {
        status: 'available',
      });
      this.client.emit('order_created', {
        rentId: id,
        userId,
        amount: totalAmount,
        currency: 'TWD',
      });
      return await this.updateRendBy(id, { endAt: endAt });
    });
  }

  async pay(id: number, payRentDto: PayRentDto) {
    const { userId } = payRentDto;
    const rent = await this.findRentBy({ id, userId });
    if (!rent) throw new NotFoundException(ERROR_MESSAGES.RENT_NOT_FOUND);
    if (rent.endAt && rent.status === RENT_STATUS.COMPLETED)
      throw new BadRequestException(ERROR_MESSAGES.RENT_COMPLETED);

    return this.prisma.$transaction(async () => {
      const response = await lastValueFrom(
        this.client.send('order_paid', {
          rentId: rent.id,
          userId,
        }),
      );
      if (response.status !== 'success')
        throw new BadRequestException(ERROR_MESSAGES.PAYMENT_FAILED);
      return await this.updateRendBy(rent.id, {
        status: RENT_STATUS.COMPLETED,
      });
    });
  }

  async findRentBy(
    rentWhereUniqueInput: Prisma.RentWhereUniqueInput,
  ): Promise<Rent | null> {
    return this.prisma.rent.findUnique({
      where: rentWhereUniqueInput,
      include: { user: true, scooter: true },
    });
  }

  async updateRendBy(
    rentId: number,
    data: Prisma.RentUpdateInput,
  ): Promise<Rent> {
    return this.prisma.rent.update({
      where: { id: rentId },
      data: data,
    });
  }

  async isUserHasUncompletedRentals(userId: number): Promise<boolean> {
    const rent = await this.prisma.rent.findFirst({
      where: {
        userId: userId,
        endAt: null,
        status: { not: RENT_STATUS.COMPLETED },
      },
    });
    return rent !== null;
  }

  async createNewRent(userId: number, scooterId: number): Promise<Rent> {
    return this.prisma.rent.create({
      data: {
        userId,
        scooterId,
        startAt: new Date(),
        status: RENT_STATUS.PENDING,
      },
    });
  }
}
