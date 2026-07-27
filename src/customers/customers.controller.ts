import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
} from '@nestjs/common';
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { ApiResponse } from '@/common/interfaces/api-response.interface';
import { CustomerResponseDto } from './dto/customer-response.dto';

@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}
  @Get()
  findAll(): Promise<ApiResponse<CustomerResponseDto[]>> {
    return this.customersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<ApiResponse<CustomerResponseDto>> {
    return this.customersService.findOne(id);
  }

  @Post()
  create(
    @Body() data: CreateCustomerDto,
  ): Promise<ApiResponse<CustomerResponseDto>> {
    return this.customersService.create(data);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() data: UpdateCustomerDto,
  ): Promise<ApiResponse<CustomerResponseDto>> {
    return this.customersService.update(id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<ApiResponse<CustomerResponseDto>> {
    return this.customersService.remove(id);
  }
}
