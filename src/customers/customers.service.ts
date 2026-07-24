import { ConflictException, Injectable } from '@nestjs/common';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { CustomerResponseDto } from './dto/customer-response.dto';
import { plainToInstance } from 'class-transformer';
import { CustomerMapper } from './mappers/customer.mapper';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CustomersService {
  constructor(private readonly prisma: PrismaService) {}
  async create(data: CreateCustomerDto): Promise<CustomerResponseDto> {
    const customer = await this.prisma.customer.create({
      data,
    });

    return plainToInstance(CustomerResponseDto, customer, {
      excludeExtraneousValues: true,
    });
  }
}
