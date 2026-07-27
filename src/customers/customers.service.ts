import { PrismaService } from '@/prisma/prisma.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { Prisma } from '@prisma/client';
import { CustomerResponseDto } from './dto/customer-response.dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class CustomersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const customers = await this.prisma.customer.findMany();

    return customers.map((customer) =>
      plainToInstance(CustomerResponseDto, customer, {
        excludeExtraneousValues: true,
      }),
    );
  }

  async findOne(id: string) {
    const customer = await this.prisma.customer.findUnique({
      where: {
        id,
      },
    });

    if (!customer) {
      throw new NotFoundException({
        message: 'Cliente no encontrado',
        code: 'CUSTOMER_NOT_FOUND',
      });
    }
    return plainToInstance(CustomerResponseDto, customer, {
      excludeExtraneousValues: true,
    });
  }

  async create(data: CreateCustomerDto) {
    const customer = await this.prisma.customer.create({
      data,
    });

    return plainToInstance(CustomerResponseDto, customer, {
      excludeExtraneousValues: true,
    });
  }

  async update(id: string, data: UpdateCustomerDto) {
    try {
      const customer = await this.prisma.customer.update({
        where: {
          id,
        },
        data,
      });

      return plainToInstance(CustomerResponseDto, customer, {
        excludeExtraneousValues: true,
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
      const customer = await this.prisma.customer.delete({
        where: {
          id,
        },
      });

      return plainToInstance(CustomerResponseDto, customer, {
        excludeExtraneousValues: true,
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
