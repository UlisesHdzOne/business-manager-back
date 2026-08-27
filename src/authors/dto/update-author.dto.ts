import { PartialType } from '@nestjs/mapped-types';
import { CreateAuthorDto } from './create-author.dto';
import { AtLeastOne } from '@/common/decorators/at-least-one.decorator';

export class UpdateAuthorDto extends PartialType(CreateAuthorDto) {
  @AtLeastOne(['firstName', 'lastName', 'email'])
  private readonly _validation?: never;
}
