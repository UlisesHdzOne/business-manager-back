import { Transform } from 'class-transformer';
import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { BasePaginationDto } from '@/common/dto/base-pagination.dto';
import { CategorySortBy } from '../enums/category-sort-by.enum';

export class CategoryQueryDto extends BasePaginationDto {
  @IsEnum(CategorySortBy)
  sortBy: CategorySortBy = CategorySortBy.CREATED_AT;

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
}
