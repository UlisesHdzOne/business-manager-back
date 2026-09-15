import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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

  async createOrder(userId: string) {
    const cart = await this.prisma.cart.findUnique({
      where: {
        userId,
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!cart) {
      throw new NotFoundException('El carrito no existe');
    }

    if (cart.items.length === 0) {
      throw new BadRequestException('El carrito está vacío');
    }

    for (const item of cart.items) {
      if (!item.product.isActive) {
        throw new BadRequestException(
          `El producto "${item.product.name}" ya no está disponible`,
        );
      }

      if (item.product.stock < item.quantity) {
        throw new BadRequestException(
          `Stock insuficiente para "${item.product.name}". Disponible: ${item.product.stock}`,
        );
      }
    }

    const total = cart.items.reduce(
      (sum, item) => sum + Number(item.product.price) * item.quantity,
      0,
    );

    const orderItems = cart.items.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
      unitPrice: item.product.price,
    }));

    const order = await this.prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          userId,
          total,
          items: {
            create: orderItems,
          },
        },
        include: orderInclude,
      });

      for (const item of cart.items) {
        const result = await tx.product.updateMany({
          where: {
            id: item.productId,
            stock: {
              gte: item.quantity,
            },
          },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });

        if (result.count === 0) {
          throw new BadRequestException(
            `Stock insuficiente para "${item.product.name}"`,
          );
        }
      }

      await tx.cartItem.deleteMany({
        where: {
          cartId: cart.id,
        },
      });

      return order;
    });

    return this.toResponse(order);
  }
}
