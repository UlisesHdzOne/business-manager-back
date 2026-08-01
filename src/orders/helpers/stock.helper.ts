import { Prisma, Product } from '@prisma/client';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ProductErrorCode } from '@/products/enums/product-error-code.enum';

type ProductMap = Map<string, Product>;

export const validateAndCalculateTotal = (
  items: { productId: string; quantity: number }[],
  productMap: ProductMap,
): Prisma.Decimal => {
  let total = new Prisma.Decimal(0);

  for (const item of items) {
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

    total = total.plus(product.price.mul(item.quantity));
  }

  return total;
};

export const decrementStock = async (
  tx: Prisma.TransactionClient,
  items: { productId: string; quantity: number }[],
): Promise<void> => {
  await Promise.all(
    items.map((item) =>
      tx.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            decrement: item.quantity,
          },
        },
      }),
    ),
  );
};

export const incrementStock = async (
  tx: Prisma.TransactionClient,
  items: { productId: string; quantity: number }[],
): Promise<void> => {
  await Promise.all(
    items.map((item) =>
      tx.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            increment: item.quantity,
          },
        },
      }),
    ),
  );
};
