import { Expose } from 'class-transformer';

export class BookResponseDto {
  @Expose()
  id!: string;

  @Expose()
  title!: string;

  @Expose()
  author!: string;

  @Expose()
  available!: boolean;
}
