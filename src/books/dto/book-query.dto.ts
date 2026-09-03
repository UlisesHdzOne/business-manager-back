import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { BookSortBy } from '../enums/book-sort-by.enum';
import { BasePaginationDto } from '@/common/dto/base-pagination.dto';

export class BookQueryDto extends BasePaginationDto {
  @IsOptional()
  @Transform(({ value }: { value: unknown }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean()
  isAvailableForLoan?: boolean;

  @IsOptional()
  @Transform(({ value }: { value: unknown }) => {
    if (typeof value !== 'string') return value;

    const title = value.trim();

    return title === '' ? undefined : title;
  })
  @IsString()
  title?: string;

  @IsEnum(BookSortBy)
  sortBy: BookSortBy = BookSortBy.CREATED_AT;

  @IsOptional()
  @Transform(({ value }: { value: unknown }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean()
  isActive?: boolean;
}
