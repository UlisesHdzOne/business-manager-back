import { Product } from '@prisma/client';
import { plainToInstance } from 'class-transformer';
import { ProductResponseDto } from '../dto/product-response.dto';

export const mapProduct = (product: Product): ProductResponseDto => {
  return plainToInstance(
    ProductResponseDto,
    {
      ...product,
      price: product.price.toNumber(),
    },
    {
      excludeExtraneousValues: true,
    },
  );
};

export const mapProducts = (products: Product[]): ProductResponseDto[] => {
  return products.map(mapProduct);
};
