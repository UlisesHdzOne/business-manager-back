import { ProductResponseDto } from '@/products/dto/product-response.dto';
import { Expose, Type } from 'class-transformer';

class OrderItemResponseDto {
  @Expose()
  id!: string;

  @Expose()
  orderId!: string;

  @Expose()
  productId!: string;

  @Expose()
  quantity!: number;

  @Expose()
  unitPrice!: number;

  @Expose()
  createdAt!: Date;

  @Expose()
  updatedAt!: Date;

  @Expose()
  @Type(() => ProductResponseDto)
  product!: ProductResponseDto;
}

export class OrderResponseDto {
  @Expose()
  id!: string;

  @Expose()
  userId!: string;

  @Expose()
  status!: string;

  @Expose()
  total!: number;

  @Expose()
  @Type(() => OrderItemResponseDto)
  items!: OrderItemResponseDto[];

  @Expose()
  createdAt!: Date;

  @Expose()
  updatedAt!: Date;
}
