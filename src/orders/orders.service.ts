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
import { ProductErrorCode } from '@/products/enums/product-error-code.enum';

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

    const productIds = dto.items.map((item) => item.productId);

    const products = await this.prisma.product.findMany({
      where: {
        id: {
          in: productIds,
        },
      },
    });

    if (products.length !== dto.items.length) {
      throw new NotFoundException({
        message: 'Uno o más productos no existen',
        code: ProductErrorCode.PRODUCT_NOT_FOUND,
      });
    }

    const productMap = new Map(
      products.map((product) => [product.id, product]),
    );

    for (const item of dto.items) {
      const product = productMap.get(item.productId);

      if (!product) {
        throw new NotFoundException({
          message: 'Producto no encontrado',
          code: ProductErrorCode.PRODUCT_NOT_FOUND,
        });
      }

      if (product.stock < item.quantity) {
        throw new BadRequestException({
          message: `Stock insuficiente para ${product.name}`,
          code: ProductErrorCode.INSUFFICIENT_STOCK,
        });
      }
    }

    const order = await this.prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          description: dto.description,
          customerId: dto.customerId,
          items: {
            create: dto.items.map((item) => {
              const product = productMap.get(item.productId)!;

              return {
                productId: item.productId,
                quantity: item.quantity,
                price: product.price,
              };
            }),
          },
        },
        include: {
          items: true,
        },
      });

      for (const item of dto.items) {
        await tx.product.update({
          where: {
            id: item.productId,
          },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });
      }

      return order;
    });
    //solo para referencia no borrar
    //console.log(JSON.stringify(order, null, 2));

    return successResponse(
      plainToInstance(OrderResponseDto, mapOrder(order), {
        excludeExtraneousValues: true,
      }),
      'Orden creada correctamente',
    );
  }

  async findAll(): Promise<ApiResponse<OrderResponseDto[]>> {
    const orders = await this.prisma.order.findMany({
      include: {
        items: true,
      },
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
    const order = await this.prisma.order.findUniqueOrThrow({
      where: {
        id,
      },
      include: {
        items: true,
      },
    });

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
    const order = await this.prisma.order.update({
      where: {
        id,
      },
      data: {
        ...(dto.description !== undefined && {
          description: dto.description,
        }),
      },
      include: {
        items: true,
      },
    });

    return successResponse(
      plainToInstance(OrderResponseDto, mapOrder(order), {
        excludeExtraneousValues: true,
      }),
      'Orden actualizada correctamente',
    );
  }

  async remove(id: string): Promise<ApiResponse<OrderResponseDto>> {
    const order = await this.prisma.$transaction(async (tx) => {
      const items = await tx.orderItem.findMany({
        where: {
          orderId: id,
        },
      });

      await tx.orderItem.deleteMany({
        where: {
          orderId: id,
        },
      });

      const deletedOrder = await tx.order.delete({
        where: {
          id,
        },
      });

      return {
        ...deletedOrder,
        items,
      };
    });

    return successResponse(
      plainToInstance(OrderResponseDto, mapOrder(order), {
        excludeExtraneousValues: true,
      }),
      'Orden eliminada correctamente',
    );
  }
}
