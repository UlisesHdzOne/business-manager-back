import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { plainToInstance } from 'class-transformer';

import { PrismaService } from '@/prisma/prisma.service';
import { OrderResponseDto } from './dto/order-response.dto';

const orderInclude = {
  items: {
    include: {
      product: true,
    },
  },
} satisfies Prisma.OrderInclude;

type OrderResponseInput = Prisma.OrderGetPayload<{
  include: typeof orderInclude;
}>;

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  private toResponse(order: OrderResponseInput): OrderResponseDto {
    return plainToInstance(
      OrderResponseDto,
      {
        ...order,
        total: Number(order.total),
        items: order.items.map((item) => ({
          ...item,
          unitPrice: Number(item.unitPrice),
          product: {
            ...item.product,
            price: Number(item.product.price),
          },
        })),
      },
      {
        excludeExtraneousValues: true,
      },
    );
  }

  async getOrders(userId: string) {
    const orders = await this.prisma.order.findMany({
      where: {
        userId,
      },
      include: orderInclude,
      orderBy: {
        createdAt: 'desc',
      },
    });

    return orders.map((order) => this.toResponse(order));
  }
}
