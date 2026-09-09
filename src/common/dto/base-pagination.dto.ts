import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsPositive, Max } from 'class-validator';
import { SortOrder } from '../enum/sort-order.enum';

export class BasePaginationDto {
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  page: number = 1;

  @Type(() => Number)
  @IsInt()
  @IsPositive()
  @Max(100)
  limit: number = 10;

  @IsEnum(SortOrder)
  order: SortOrder = SortOrder.ASC;
}
