import { PrismaService } from '@/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { CreateCustomerDto } from './dto/create-customer.dto';

@Injectable()
export class CustomersService {
  constructor(private readonly prisma: PrismaService) { }

  findAll() {
    return this.prisma.customer.findMany();
  }

  create(data: CreateCustomerDto) {
    return this.prisma.customer.create({
      data,
    });
  }
}
