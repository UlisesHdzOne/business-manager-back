import { PrismaService } from '@/prisma/prisma.service';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { successResponse } from '@/common/helpers/api-response.helper';
import { OrderResponseDto } from './dto/order-response.dto';
import { plainToInstance } from 'class-transformer';
import { UpdateOrderDto } from './dto/update-order.dto';
import { ApiResponse } from '@/common/interfaces/api-response.interface';
import { CustomerErrorCode } from '@/customers/enums/customer-error-code.enum';
import { mapOrder, mapOrders } from './mappers/order.mapper';
import { OrderStatus } from '@prisma/client';

import {
  validateAndCalculateTotal,
  decrementStock,
  incrementStock,
} from './helpers/stock.helper';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createOrderDto: CreateOrderDto) {
    const { customerId, description, items } = createOrderDto;

    return this.prisma.$transaction(async (tx) => {
      const customer = await tx.customer.findUnique({
        where: { id: customerId },
      });

      if (!customer) {
        throw new NotFoundException({
          message: 'Cliente no encontrado',
          code: CustomerErrorCode.CUSTOMER_NOT_FOUND,
        });
      }

      const productIds = items.map((item) => item.productId);

      const products = await tx.product.findMany({
        where: { id: { in: productIds } },
      });

      if (products.length !== productIds.length) {
        throw new NotFoundException({
          message: 'Uno o más productos no existen',
        });
      }

      const productMap = new Map(
        products.map((product) => [product.id, product]),
      );

      const total = validateAndCalculateTotal(items, productMap);

      const order = await tx.order.create({
        data: {
          customerId,
          description,
          total,
          items: {
            create: items.map((item) => {
              const product = productMap.get(item.productId)!;
              return {
                productId: item.productId,
                quantity: item.quantity,
                price: product.price,
              };
            }),
          },
        },
        include: { items: true },
      });

      await decrementStock(tx, items);

      return order;
    });
  }

  async findAll(): Promise<ApiResponse<OrderResponseDto[]>> {
    const orders = await this.prisma.order.findMany({
      include: { items: true },
    });

    return successResponse(
      mapOrders(orders).map((order) =>
        plainToInstance(OrderResponseDto, order, {
          excludeExtraneousValues: true,
        }),
      ),
      'Órdenes obtenidas correctamente',
    );
  }

  async findOne(id: string): Promise<ApiResponse<OrderResponseDto>> {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!order) {
      throw new NotFoundException({ message: 'Orden no encontrada' });
    }

    return successResponse(
      plainToInstance(OrderResponseDto, mapOrder(order), {
        excludeExtraneousValues: true,
      }),
      'Orden obtenida correctamente',
    );
  }

  async update(
    id: string,
    dto: UpdateOrderDto,
  ): Promise<ApiResponse<OrderResponseDto>> {
    const order = await this.prisma.order.findUnique({
      where: { id },
    });

    if (!order) {
      throw new NotFoundException({ message: 'Orden no encontrada' });
    }

    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException({
        message: 'Solo puedes editar órdenes pendientes',
      });
    }

    const updated = await this.prisma.order.update({
      where: { id },
      data: {
        ...(dto.description !== undefined && {
          description: dto.description,
        }),
      },
      include: { items: true },
    });

    return successResponse(
      plainToInstance(OrderResponseDto, mapOrder(updated), {
        excludeExtraneousValues: true,
      }),
      'Orden actualizada correctamente',
    );
  }

  async remove(id: string): Promise<ApiResponse<OrderResponseDto>> {
    const deleted = await this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id },
        include: { items: true },
      });

      if (!order) {
        throw new NotFoundException({ message: 'Orden no encontrada' });
      }

      if (order.status === OrderStatus.COMPLETED) {
        throw new BadRequestException({
          message: 'No puedes eliminar una orden completada',
        });
      }

      if (order.status !== OrderStatus.CANCELLED) {
        await incrementStock(
          tx,
          order.items.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
          })),
        );
      }

      return tx.order.delete({
        where: { id },
        include: { items: true },
      });
    });

    return successResponse(
      plainToInstance(OrderResponseDto, mapOrder(deleted), {
        excludeExtraneousValues: true,
      }),
      'Orden eliminada correctamente',
    );
  }

  async complete(id: string): Promise<ApiResponse<OrderResponseDto>> {
    const order = await this.prisma.order.findUnique({
      where: { id },
    });

    if (!order) {
      throw new NotFoundException({ message: 'Orden no encontrada' });
    }

    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException({
        message: 'Solo puedes completar órdenes pendientes',
      });
    }

    const updated = await this.prisma.order.update({
      where: { id },
      data: { status: OrderStatus.COMPLETED },
      include: { items: true },
    });

    return successResponse(
      plainToInstance(OrderResponseDto, mapOrder(updated), {
        excludeExtraneousValues: true,
      }),
      'Orden completada correctamente',
    );
  }

  async cancel(id: string): Promise<ApiResponse<OrderResponseDto>> {
    const updated = await this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id },
        include: { items: true },
      });

      if (!order) {
        throw new NotFoundException({ message: 'Orden no encontrada' });
      }

      if (order.status === OrderStatus.CANCELLED) {
        throw new BadRequestException({
          message: 'La orden ya está cancelada',
        });
      }

      if (order.status === OrderStatus.COMPLETED) {
        throw new BadRequestException({
          message: 'No puedes cancelar una orden completada',
        });
      }

      await incrementStock(
        tx,
        order.items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
        })),
      );

      return tx.order.update({
        where: { id },
        data: { status: OrderStatus.CANCELLED },
        include: { items: true },
      });
    });

    return successResponse(
      plainToInstance(OrderResponseDto, mapOrder(updated), {
        excludeExtraneousValues: true,
      }),
      'Orden cancelada correctamente',
    );
  }
}
