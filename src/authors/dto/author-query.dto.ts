import { BasePaginationDto } from '@/common/dto/base-pagination.dto';
import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { AuthorSortBy } from '../enums/author-sort-by.enum';

export class AuthorQueryDto extends BasePaginationDto {
  @IsEnum(AuthorSortBy)
  sortBy: AuthorSortBy = AuthorSortBy.CREATED_AT;

  @IsOptional()
  @Transform(({ value }: { value: unknown }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean()
  active?: boolean;

  @IsOptional()
  @Transform(({ value }: { value: unknown }) => {
    if (typeof value !== 'string') return value;

    const name = value.trim();

    return name === '' ? undefined : name;
  })
  @IsString()
  name?: string;
}
