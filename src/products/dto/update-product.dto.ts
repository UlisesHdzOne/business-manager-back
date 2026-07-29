import { IsOptional } from 'class-validator';

export class UpdateProductDto {
  @IsOptional()
  name?: string;
  @IsOptional()
  description?: string;
  @IsOptional()
  @IsOptional()
  price?: number;
  @IsOptional()
  stock?: number;
}
