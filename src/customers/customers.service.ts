import { PrismaService } from '@/prisma/prisma.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCustomerDto } from './dto/create-customer.dto';

@Injectable()
export class CustomersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const customers = await this.prisma.customer.findMany();
    return customers;
  }

  async findOne(id: string) {
    const customer = await this.prisma.customer.findUnique({
      where: {
        id,
      },
    });

    if (!customer) {
      throw new NotFoundException('Cliente no encontrado');
    }
    return customer;
  }

  create(data: CreateCustomerDto) {
    return this.prisma.customer.create({
      data,
    });
  }
}
