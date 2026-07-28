import { PrismaService } from '@/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { successResponse } from '@/common/helpers/api-response.helper';
import { OrderResponseDto } from './dto/order-response.dto';
import { plainToInstance } from 'class-transformer';
import { UpdateOrderDto } from './dto/update-order.dto';
import { ApiResponse } from '@/common/interfaces/api-response.interface';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateOrderDto): Promise<ApiResponse<OrderResponseDto>> {
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
    const orders = await this.prisma.order.findMany();

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
