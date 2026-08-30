import { Expose } from 'class-transformer';

export class LoanResponseDto {
  @Expose()
  id!: string;

  @Expose()
  userId!: string;

  @Expose()
  bookId!: string;

  @Expose()
  loanDate!: Date;

  @Expose()
  returnDate!: Date | null;
}
