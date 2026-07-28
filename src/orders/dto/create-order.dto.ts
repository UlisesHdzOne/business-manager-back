import { IsString, IsUUID, MinLength } from 'class-validator';

export class CreateOrderDto {
  @IsString()
  @MinLength(3)
  description!: string;

  @IsUUID()
  customerId!: string;
}
