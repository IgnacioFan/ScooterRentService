import { Test, TestingModule } from '@nestjs/testing';
import { RentController } from './rent.controller';
import { RentService } from './rent.service';
import { CreateRentDto } from './dto/create-rent.dto';
import { EndRentDto } from './dto/end-rent.dto';
import { PayRentDto } from './dto/pay-rent.dto';

describe('RentController', () => {
  let controller: RentController;
  let service: RentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RentController],
      providers: [
        {
          provide: RentService,
          useValue: {
            create: jest.fn(),
            end: jest.fn(),
            pay: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<RentController>(RentController);
    service = module.get<RentService>(RentService);
  });

  describe('create', () => {
    it('return a rent object', async () => {
      const dto: CreateRentDto = { userId: 1, scooterId: 1 };
      const result = {
        id: 1,
        userId: 1,
        scooterId: 1,
        startAt: new Date(),
        endAt: null,
        status: 'pending',
      };
      jest.spyOn(service, 'create').mockResolvedValue(result);

      expect(controller).toBeDefined();
      expect(await controller.create(dto)).toEqual(result);
      expect(service.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('end', () => {
    it('return a rent object', async () => {
      const id = 1;
      const dto: EndRentDto = { userId: 1 };
      const result = {
        id: 1,
        userId: 1,
        scooterId: 1,
        startAt: new Date(),
        endAt: new Date(),
        status: 'pending',
      };
      jest.spyOn(service, 'end').mockResolvedValue(result);

      expect(await controller.end(id.toString(), dto)).toEqual(result);
      expect(service.end).toHaveBeenCalledWith(id, dto);
    });
  });

  describe('pay', () => {
    it('return a rent object', async () => {
      const id = 1;
      const dto: PayRentDto = { userId: 1 };
      const result = {
        id: 1,
        userId: 1,
        scooterId: 1,
        startAt: new Date(),
        endAt: new Date(),
        status: 'completed',
      };
      jest.spyOn(service, 'pay').mockResolvedValue(result);

      expect(await controller.pay(id.toString(), dto)).toEqual(result);
      expect(service.pay).toHaveBeenCalledWith(id, dto);
    });
  });
});
