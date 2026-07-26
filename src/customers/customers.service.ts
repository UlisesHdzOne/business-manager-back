import { PrismaService } from '@/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { CreateCustomerDto } from './dto/create-customer.dto';

@Injectable()
export class CustomersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const customers = await this.prisma.customer.findMany();
    return customers;
  }

  create(data: CreateCustomerDto) {
    return this.prisma.customer.create({
      data,
    });
  }
}
