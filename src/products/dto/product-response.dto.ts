import { Expose } from 'class-transformer';

export class ProductResponseDto {
  @Expose()
  id!: string;

  @Expose()
  name!: string;

  @Expose()
  description!: string | null;

  @Expose()
  price!: number;

  @Expose()
  stock!: number;

  @Expose()
  isActive!: boolean;

  @Expose()
  categoryId!: string;

  @Expose()
  createdAt!: Date;

  @Expose()
  updatedAt!: Date;
}
