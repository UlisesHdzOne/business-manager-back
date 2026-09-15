import { ProductResponseDto } from '@/products/dto/product-response.dto';
import { Expose, Type } from 'class-transformer';

class CartItemResponseDto {
  @Expose()
  id!: string;

  @Expose()
  cartId!: string;

  @Expose()
  productId!: string;

  @Expose()
  quantity!: number;

  @Expose()
  createdAt!: Date;

  @Expose()
  updatedAt!: Date;

  @Expose()
  @Type(() => ProductResponseDto)
  product!: ProductResponseDto;
}

export class CartResponseDto {
  @Expose()
  id!: string;

  @Expose()
  userId!: string;

  @Expose()
  createdAt!: Date;

  @Expose()
  updatedAt!: Date;

  @Expose()
  @Type(() => CartItemResponseDto)
  items!: CartItemResponseDto[];
}
