import { IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateOrderDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  description?: string;
}
