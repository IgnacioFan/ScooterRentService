import { Injectable } from '@nestjs/common';
import { CreateRentDto } from './dto/create-rent.dto';
import { EndRentDto } from './dto/end-rent.dto';
import { PayRentDto } from './dto/pay-rent.dto';

@Injectable()
export class RentsService {
  create(createRentDto: CreateRentDto) {
    return createRentDto;
  }

  end(id: number, endRentDto: EndRentDto) {
    // console.log(id, endRentDto)
    return `This action updates a #${id} rent`;
  }

  pay(id: number, payRentDto: PayRentDto) {
    return `This action updates a #${id} rent`;
  }
}
