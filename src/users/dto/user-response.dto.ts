import { BaseUserResponseDto } from '@/common/dto/base-user-response.dto';
import { Expose } from 'class-transformer';

export class UserResponseDto extends BaseUserResponseDto {
  @Expose()
  phone!: string;
}
