import { Expose, Type } from 'class-transformer';

class CartItemProductResponseDto {
  @Expose()
  id!: string;

  @Expose()
  name!: string;

  @Expose()
  description!: string | null;

  @Expose()
  price!: number;

  @Expose()
  stock!: number;

  @Expose()
  isActive!: boolean;

  @Expose()
  categoryId!: string;

  @Expose()
  createdAt!: Date;

  @Expose()
  updatedAt!: Date;
}

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
  @Type(() => CartItemProductResponseDto)
  product!: CartItemProductResponseDto;
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
