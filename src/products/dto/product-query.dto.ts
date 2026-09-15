import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { BasePaginationDto } from '@/common/dto/base-pagination.dto';
import { ProductSortBy } from '../enums/product-sort-by.enum';
import { TransformBoolean } from '@/common/decorators/transform-boolean.decorator';
import { TransformTrim } from '@/common/decorators/transform-trim.decorator';

export class ProductQueryDto extends BasePaginationDto {
  @IsEnum(ProductSortBy)
  sortBy: ProductSortBy = ProductSortBy.CREATED_AT;

  @IsOptional()
  @TransformBoolean()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @TransformTrim()
  @IsString()
  name?: string;

  @IsOptional()
  @IsUUID('4', {
    message: 'El categoryId debe ser un UUID válido',
  })
  categoryId?: string;
}
