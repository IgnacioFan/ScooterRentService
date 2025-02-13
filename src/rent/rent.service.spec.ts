import { Test, TestingModule } from '@nestjs/testing';
import { RentService } from './rent.service';
import { PrismaService } from '../prisma.service';
import { ScooterService } from '../scooter/scooter.service';
import { UserService } from '../user/user.service';
import { BadRequestException } from '@nestjs/common';
import { ORDER_SERVICE } from '../constant/services';

describe('RentService', () => {
  let service: RentService;
  let prisma: PrismaService;
  let scooterService: ScooterService;
  let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RentService,
        { provide: PrismaService, useValue: { $transaction: jest.fn() } },
        {
          provide: ScooterService,
          useValue: { findScooterBy: jest.fn(), updateScooterBy: jest.fn() },
        },
        { provide: UserService, useValue: { findUserBy: jest.fn() } },
        {
          provide: ORDER_SERVICE,
          useValue: { emit: jest.fn(), send: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<RentService>(RentService);
    prisma = module.get<PrismaService>(PrismaService);
    scooterService = module.get<ScooterService>(ScooterService);
    userService = module.get<UserService>(UserService);
  });

  describe('create', () => {
    it('should throw an error if the scooter is not available', async () => {
      jest.spyOn(scooterService, 'findScooterBy').mockResolvedValue({
        id: 1,
        name: 'Scooter A',
        serialNumber: 'TWTP123',
        licensePlate: 'ABC-123',
        status: 'rented',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      await expect(service.create({ scooterId: 1, userId: 1 })).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw an error if the user has an uncompleted rental', async () => {
      jest.spyOn(scooterService, 'findScooterBy').mockResolvedValue({
        id: 1,
        name: 'Scooter A',
        serialNumber: 'TWTP123',
        licensePlate: 'ABC-123',
        status: 'available',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      jest.spyOn(userService, 'findUserBy').mockResolvedValue({
        id: 1,
        email: 'foo@example.com',
        name: 'Foo',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      jest
        .spyOn(service, 'isUserHasUncompletedRentals')
        .mockResolvedValue(true);

      await expect(service.create({ scooterId: 1, userId: 1 })).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should successfully create a rent', async () => {
      jest.spyOn(scooterService, 'findScooterBy').mockResolvedValue({
        id: 1,
        name: 'Scooter A',
        serialNumber: 'TWTP123',
        licensePlate: 'ABC-123',
        status: 'available',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      jest.spyOn(userService, 'findUserBy').mockResolvedValue({
        id: 1,
        email: 'foo@example.com',
        name: 'Foo',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      jest
        .spyOn(service, 'isUserHasUncompletedRentals')
        .mockResolvedValue(false);
      const rent = {
        id: 1,
        scooterId: 1,
        userId: 1,
        startAt: new Date(),
        endAt: null,
        status: 'pending',
      };
      jest.spyOn(prisma, '$transaction').mockImplementation(async () => rent);

      const result = await service.create({ scooterId: 1, userId: 1 });
      expect(result).toEqual(rent);
    });
  });
});
