import { Expose } from 'class-transformer';

export class BookResponseDto {
  @Expose()
  id!: string;

  @Expose()
  title!: string;

  @Expose()
  authorId!: string | null;

  @Expose()
  active!: boolean;

  @Expose()
  available!: boolean;

  @Expose()
  inactiveReason!: string | null;
}
