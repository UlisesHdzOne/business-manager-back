import { PrismaService } from '@/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { CustomerResponseDto } from './dto/customer-response.dto';
import { plainToInstance } from 'class-transformer';
import { successResponse } from '@/common/helpers/api-response.helper';
import { ApiResponse } from '@/common/interfaces/api-response.interface';

@Injectable()
export class CustomersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<ApiResponse<CustomerResponseDto[]>> {
    const customers = await this.prisma.customer.findMany();

    const data = customers.map((customer) =>
      plainToInstance(CustomerResponseDto, customer, {
        excludeExtraneousValues: true,
      }),
    );

    return successResponse(data, 'Clientes obtenidos correctamente');
  }

  async findOne(id: string): Promise<ApiResponse<CustomerResponseDto>> {
    const customer = await this.prisma.customer.findUniqueOrThrow({
      where: {
        id,
      },
    });

    return successResponse(
      plainToInstance(CustomerResponseDto, customer, {
        excludeExtraneousValues: true,
      }),
      'Cliente obtenido correctamente',
    );
  }

  async create(
    data: CreateCustomerDto,
  ): Promise<ApiResponse<CustomerResponseDto>> {
    const customer = await this.prisma.customer.create({
      data,
    });

    return successResponse(
      plainToInstance(CustomerResponseDto, customer, {
        excludeExtraneousValues: true,
      }),
      'Cliente creado correctamente',
    );
  }

  async update(
    id: string,
    data: UpdateCustomerDto,
  ): Promise<ApiResponse<CustomerResponseDto>> {
    const customer = await this.prisma.customer.update({
      where: {
        id,
      },
      data,
    });

    return successResponse(
      plainToInstance(CustomerResponseDto, customer, {
        excludeExtraneousValues: true,
      }),
      'Cliente actualizado correctamente',
    );
  }

  async remove(id: string): Promise<ApiResponse<CustomerResponseDto>> {
    const customer = await this.prisma.customer.delete({
      where: {
        id,
      },
    });

    return successResponse(
      plainToInstance(CustomerResponseDto, customer, {
        excludeExtraneousValues: true,
      }),
      'Cliente eliminado correctamente',
    );
  }
}
