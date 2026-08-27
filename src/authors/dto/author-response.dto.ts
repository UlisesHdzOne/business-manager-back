import { BaseUserResponseDto } from '@/common/dto/base-user-response.dto';
import { Expose } from 'class-transformer';

export class AuthorResponseDto extends BaseUserResponseDto {
  @Expose()
  active!: boolean;
}
