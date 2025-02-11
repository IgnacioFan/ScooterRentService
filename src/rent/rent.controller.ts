import { Controller, Post, Body, Patch, Param } from '@nestjs/common';
import { RentService } from './rent.service';
import { CreateRentDto } from './dto/create-rent.dto';
import { EndRentDto } from './dto/end-rent.dto';
import { PayRentDto } from './dto/pay-rent.dto';

@Controller('rents')
export class RentController {
  constructor(private readonly rentService: RentService) {}

  @Post()
  create(@Body() createRentDto: CreateRentDto) {
    return this.rentService.create(createRentDto);
  }

  @Patch(':id/end')
  end(@Param('id') id: string, @Body() endRentDto: EndRentDto) {
    return this.rentService.end(+id, endRentDto);
  }

  @Patch(':id/pay')
  pay(@Param('id') id: string, @Body() payRentDto: PayRentDto) {
    return this.rentService.pay(+id, payRentDto);
  }
}
