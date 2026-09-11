import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { plainToInstance } from 'class-transformer';
import { CartResponseDto } from './dto/cart-response.dto';

const cartInclude = {
  items: {
    include: {
      product: true,
    },
  },
} satisfies Prisma.CartInclude;

type CartResponseInput = Prisma.CartGetPayload<{
  include: typeof cartInclude;
}>;

@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) {}

  private toResponse(cart: CartResponseInput): CartResponseDto {
    return plainToInstance(CartResponseDto, cart, {
      excludeExtraneousValues: true,
    });
  }

  async getCart(userId: string) {
    let cart = await this.prisma.cart.findUnique({
      where: {
        userId,
      },
      include: cartInclude,
    });

    if (!cart) {
      cart = await this.prisma.cart.create({
        data: {
          userId,
        },
        include: cartInclude,
      });
    }

    return this.toResponse(cart);
  }
}
