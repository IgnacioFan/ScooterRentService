import { Controller, Post, Body, Patch, Param } from '@nestjs/common';
import { RentsService } from './rents.service';
import { CreateRentDto } from './dto/create-rent.dto';
import { EndRentDto } from './dto/end-rent.dto';
import { PayRentDto } from './dto/pay-rent.dto';

@Controller('rents')
export class RentsController {
  constructor(private readonly rentsService: RentsService) {}

  @Post()
  create(@Body() createRentDto: CreateRentDto) {
    return this.rentsService.create(createRentDto);
  }

  @Patch(':id/end')
  end(@Param('id') id: string, @Body() endRentDto: EndRentDto) {
    return this.rentsService.end(+id, endRentDto);
  }

  @Patch(':id/pay')
  pay(@Param('id') id: string, @Body() payRentDto: PayRentDto) {
    return this.rentsService.pay(+id, payRentDto);
  }
}
