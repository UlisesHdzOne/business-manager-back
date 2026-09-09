import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { AtLeastOne } from '@/common/decorators/at-least-one.decorator';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @AtLeastOne(['firstName', 'lastName', 'email', 'phone', 'password'])
  private readonly _validation?: never;
}
