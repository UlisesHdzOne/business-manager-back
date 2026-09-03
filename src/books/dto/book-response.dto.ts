import { Expose } from 'class-transformer';

export class BookResponseDto {
  @Expose()
  id!: string;

  @Expose()
  title!: string;

  @Expose()
  authorId!: string;

  @Expose()
  isActive!: boolean;

  @Expose()
  isAvailableForLoan!: boolean;

  @Expose()
  description!: string | null;

  @Expose()
  inactiveReason!: string | null;
}
