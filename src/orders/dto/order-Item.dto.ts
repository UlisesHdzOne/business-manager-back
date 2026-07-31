import { Expose } from 'class-transformer';

export class OrderItemDto {
  @Expose()
  id!: string;

  @Expose()
  orderId!: string;

  @Expose()
  productId!: string;

  @Expose()
  quantity!: number;

  @Expose()
  price!: string;
}
