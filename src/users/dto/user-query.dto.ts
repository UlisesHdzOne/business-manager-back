import { BasePaginationDto } from '@/common/dto/base-pagination.dto';
import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { UserSortBy } from '../enums/user-sort-by.enum';
import { Transform } from 'class-transformer';

export class UserQueryDto extends BasePaginationDto {
  @IsEnum(UserSortBy)
  sortBy: UserSortBy = UserSortBy.CREATED_AT;

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
