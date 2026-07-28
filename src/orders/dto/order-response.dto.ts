import { CustomerResponseDto } from '@/customers/dto/customer-response.dto';
import { Expose, Type } from 'class-transformer';

export class OrderResponseDto {
  @Expose()
  id!: string;

  @Expose()
  description!: string;

  @Expose()
  customerId!: string;

  @Expose()
  @Type(() => CustomerResponseDto)
  customer!: CustomerResponseDto;
}
