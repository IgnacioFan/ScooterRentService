import { PartialType } from '@nestjs/mapped-types';
import { CreateRentDto } from './create-rent.dto';

export class PayRentDto extends PartialType(CreateRentDto) {}
