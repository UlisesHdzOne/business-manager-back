import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  Max,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { SortOrder } from '../enums/sort-order.enum';
import { SortBy } from '../enums/sort-by.enum';

export class BookQueryDto {
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  page: number = 1;

  @Type(() => Number)
  @IsInt()
  @IsPositive()
  @Max(100)
  limit: number = 10;

  @IsOptional()
  @Transform(({ value }: { value: unknown }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean()
  available?: boolean;

  @IsOptional()
  @IsString()
  title?: string;

  @IsEnum(SortOrder)
  order: SortOrder = SortOrder.ASC;

  @IsEnum(SortBy)
  sortBy: SortBy = SortBy.CREATED_AT;
}
