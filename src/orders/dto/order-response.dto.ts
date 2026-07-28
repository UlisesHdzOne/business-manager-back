import { Expose } from 'class-transformer';

export class OrderResponseDto {
  @Expose()
  id!: string;

  @Expose()
  description!: string;

  @Expose()
  customerId!: string;
}
