import { PrismaService } from '@/prisma/prisma.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { Prisma } from '@prisma/client';

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

  async update(id: string, data: UpdateCustomerDto) {
    try {
      return await this.prisma.customer.update({
        where: {
          id,
        },
        data,
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException('Cliente no encontrado');
      }

      throw error;
    }
  }

  async remove(id: string) {
    try {
      return await this.prisma.customer.delete({
        where: {
          id,
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException('Cliente no encontrado');
      }

      throw error;
    }
  }
}
