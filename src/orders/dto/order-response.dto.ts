import { Expose, Type } from 'class-transformer';
import { OrderItemDto } from './order-Item.dto';

export class OrderResponseDto {
  @Expose()
  id!: string;

  @Expose()
  description!: string;

  @Expose()
  customerId!: string;

  @Expose()
  @Type(() => OrderItemDto)
  items!: OrderItemDto[];
}
