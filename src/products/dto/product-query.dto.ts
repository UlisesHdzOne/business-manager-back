import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { BasePaginationDto } from '@/common/dto/base-pagination.dto';
import { ProductSortBy } from '../enums/product-sort-by.enum';

export class ProductQueryDto extends BasePaginationDto {
  @IsEnum(ProductSortBy)
  sortBy: ProductSortBy = ProductSortBy.CREATED_AT;

  @IsOptional()
  @Transform(({ value }: { value: unknown }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @Transform(({ value }: { value: unknown }) => {
    if (typeof value !== 'string') return value;

    const name = value.trim();

    return name === '' ? undefined : name;
  })
  @IsString()
  name?: string;

  @IsOptional()
  @IsUUID('4', {
    message: 'El categoryId debe ser un UUID válido',
  })
  categoryId?: string;
}
