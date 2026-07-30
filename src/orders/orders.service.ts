import { PrismaService } from '@/prisma/prisma.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { successResponse } from '@/common/helpers/api-response.helper';
import { OrderResponseDto } from './dto/order-response.dto';
import { plainToInstance } from 'class-transformer';
import { UpdateOrderDto } from './dto/update-order.dto';
import { ApiResponse } from '@/common/interfaces/api-response.interface';
import { CustomerErrorCode } from '@/customers/enums/customer-error-code.enum';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateOrderDto): Promise<ApiResponse<OrderResponseDto>> {
    const customer = await this.prisma.customer.findUnique({
      where: {
        id: dto.customerId,
      },
    });

    if (!customer) {
      throw new NotFoundException({
        message: 'Cliente no encontrado',
        code: CustomerErrorCode.CUSTOMER_NOT_FOUND,
      });
    }

    const order = await this.prisma.order.create({
      data: {
        description: dto.description,
        customerId: dto.customerId,
      },
    });

    return successResponse(
      plainToInstance(OrderResponseDto, order, {
        excludeExtraneousValues: true,
      }),
      'Orden creada correctamente',
    );
  }
  async findAll(): Promise<ApiResponse<OrderResponseDto[]>> {
    const orders = await this.prisma.order.findMany({
      include: {
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    return successResponse(
      orders.map((order) =>
        plainToInstance(OrderResponseDto, order, {
          excludeExtraneousValues: true,
        }),
      ),
      'Órdenes obtenidas correctamente',
    );
  }
  async findOne(id: string): Promise<ApiResponse<OrderResponseDto>> {
    const order = await this.prisma.order.findUniqueOrThrow({
      where: { id },
      include: {
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    return successResponse(
      plainToInstance(OrderResponseDto, order, {
        excludeExtraneousValues: true,
      }),
      'Orden obtenida correctamente',
    );
  }
  async update(
    id: string,
    dto: UpdateOrderDto,
  ): Promise<ApiResponse<OrderResponseDto>> {
    const order = await this.prisma.order.update({
      where: { id },
      data: {
        ...(dto.description !== undefined && { description: dto.description }),
      },
    });

    return successResponse(
      plainToInstance(OrderResponseDto, order, {
        excludeExtraneousValues: true,
      }),
      'Orden actualizada correctamente',
    );
  }
  async remove(id: string): Promise<ApiResponse<OrderResponseDto>> {
    const order = await this.prisma.order.delete({
      where: { id },
    });

    return successResponse(
      plainToInstance(OrderResponseDto, order, {
        excludeExtraneousValues: true,
      }),
      'Orden eliminada correctamente',
    );
  }
}
