import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Scooter, Prisma } from '@prisma/client';

@Injectable()
export class ScooterService {
  constructor(private prisma: PrismaService) {}

  async findScooterBy(
    scooterWhereUniqueInput: Prisma.ScooterWhereUniqueInput,
  ): Promise<Scooter | null> {
    return this.prisma.scooter.findUnique({ where: scooterWhereUniqueInput });
  }

  // async updateScooterBy(
  //   where: Prisma.ScooterWhereUniqueInput,
  //   data: Prisma.ScooterUpdateInput
  // ): Promise<Scooter> {
  //   return this.prisma.scooter.update({
  //     where,
  //     data
  //   });
  // }
}
