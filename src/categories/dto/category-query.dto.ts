import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { BasePaginationDto } from '@/common/dto/base-pagination.dto';
import { CategorySortBy } from '../enums/category-sort-by.enum';
import { TransformBoolean } from '@/common/decorators/transform-boolean.decorator';
import { TransformTrim } from '@/common/decorators/transform-trim.decorator';

export class CategoryQueryDto extends BasePaginationDto {
  @IsEnum(CategorySortBy)
  sortBy: CategorySortBy = CategorySortBy.CREATED_AT;

  @IsOptional()
  @TransformBoolean()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @TransformTrim()
  @IsString()
  name?: string;
}
