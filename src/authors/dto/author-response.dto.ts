import { BasePersonResponseDto } from '@/common/dto/base-person-response.dto';
import { Expose } from 'class-transformer';

export class AuthorResponseDto extends BasePersonResponseDto {
  @Expose()
  active!: boolean;
}
