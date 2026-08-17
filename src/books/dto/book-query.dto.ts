import { IsInt, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';

export class BookQueryDto {
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  page!: number;

  @Type(() => Number)
  @IsInt()
  @IsPositive()
  limit!: number;
}
