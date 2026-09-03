import { PartialType } from '@nestjs/mapped-types';
import { AtLeastOne } from '@/common/decorators/at-least-one.decorator';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @AtLeastOne(['firstName', 'lastName', 'email', 'phone'])
  private readonly _validation?: never;
}
