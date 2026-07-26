import { Controller, Get, Post, Body } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';

@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}
  @Get()
  findAll() {
    return this.customersService.findAll();
  }

  @Post()
  create(@Body() data: CreateCustomerDto) {
    return this.customersService.create(data);
  }
}
