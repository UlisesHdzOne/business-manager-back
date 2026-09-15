import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { BasePaginationDto } from '@/common/dto/base-pagination.dto';
import { UserSortBy } from '../enums/user-sort-by.enum';
import { TransformBoolean } from '@/common/decorators/transform-boolean.decorator';
import { TransformTrim } from '@/common/decorators/transform-trim.decorator';

export class UserQueryDto extends BasePaginationDto {
  @IsEnum(UserSortBy)
  sortBy: UserSortBy = UserSortBy.CREATED_AT;

  @IsOptional()
  @TransformBoolean()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @TransformTrim()
  @IsString()
  name?: string;
}
