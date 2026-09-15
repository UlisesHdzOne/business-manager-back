import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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
    return plainToInstance(
      CartResponseDto,
      {
        ...cart,
        items: cart.items.map((item) => ({
          ...item,
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

  async addItem(userId: string, productId: string, quantity: number) {
    const product = await this.prisma.product.findUnique({
      where: {
        id: productId,
      },
    });

    if (!product) {
      throw new NotFoundException('El producto no existe');
    }

    if (!product.isActive) {
      throw new BadRequestException('El producto no está disponible');
    }

    if (product.stock < quantity) {
      throw new BadRequestException(
        `Stock insuficiente. Disponible: ${product.stock}`,
      );
    }

    let cart = await this.prisma.cart.findUnique({
      where: {
        userId,
      },
    });

    if (!cart) {
      cart = await this.prisma.cart.create({
        data: {
          userId,
        },
      });
    }

    const cartItem = await this.prisma.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId,
        },
      },
    });

    const newQuantity = (cartItem?.quantity ?? 0) + quantity;

    if (newQuantity > product.stock) {
      throw new BadRequestException(
        `Stock insuficiente. Disponible: ${product.stock}`,
      );
    }

    if (cartItem) {
      await this.prisma.cartItem.update({
        where: {
          id: cartItem.id,
        },
        data: {
          quantity: newQuantity,
        },
      });
    } else {
      await this.prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          quantity,
        },
      });
    }

    const updatedCart = await this.prisma.cart.findUniqueOrThrow({
      where: {
        id: cart.id,
      },
      include: cartInclude,
    });

    return this.toResponse(updatedCart);
  }

  async updateItem(userId: string, productId: string, quantity: number) {
    const cart = await this.prisma.cart.findUnique({
      where: {
        userId,
      },
    });

    if (!cart) {
      throw new NotFoundException('El carrito no existe');
    }

    const cartItem = await this.prisma.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId,
        },
      },
      include: {
        product: true,
      },
    });

    if (!cartItem) {
      throw new NotFoundException('El producto no está en el carrito');
    }

    if (!cartItem.product.isActive) {
      throw new BadRequestException('El producto no está disponible');
    }

    if (quantity > cartItem.product.stock) {
      throw new BadRequestException(
        `Stock insuficiente. Disponible: ${cartItem.product.stock}`,
      );
    }

    await this.prisma.cartItem.update({
      where: {
        id: cartItem.id,
      },
      data: {
        quantity,
      },
    });

    const updatedCart = await this.prisma.cart.findUniqueOrThrow({
      where: {
        id: cart.id,
      },
      include: cartInclude,
    });

    return this.toResponse(updatedCart);
  }
}
