import { IsBoolean, IsEnum, IsOptional, IsUUID } from 'class-validator';
import { Transform } from 'class-transformer';
import { BasePaginationDto } from '@/common/dto/base-pagination.dto';
import { LoanSortBy } from '../enums/loan-sort-by.enum';

export class LoanQueryDto extends BasePaginationDto {
  @IsOptional()
  @IsUUID('4')
  userId?: string;

  @IsOptional()
  @IsUUID('4')
  bookId?: string;

  @IsOptional()
  @Transform(({ value }: { value: unknown }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean()
  active?: boolean;

  @IsEnum(LoanSortBy)
  sortBy: LoanSortBy = LoanSortBy.LOAN_DATE;
}
