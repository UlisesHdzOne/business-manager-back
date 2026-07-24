import { Exclude, Expose, Transform } from 'class-transformer';

@Exclude()
export class CustomerResponseDto {
  @Expose()
  id!: string;

  @Expose()
  firstName!: string;

  @Expose()
  lastName!: string;
}
