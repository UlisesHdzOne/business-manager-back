import { BasePersonResponseDto } from '@/common/dto/base-person-response.dto';
import { Expose } from 'class-transformer';

export class UserResponseDto extends BasePersonResponseDto {
  @Expose()
  phone!: string;

  @Expose()
  isActive!: boolean;
}
