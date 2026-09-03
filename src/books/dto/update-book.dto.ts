import { PartialType } from '@nestjs/mapped-types';
import { AtLeastOne } from '@/common/decorators/at-least-one.decorator';
import { CreateBookDto } from './create-book.dto';

export class UpdateBookDto extends PartialType(CreateBookDto) {
  @AtLeastOne(['title', 'authorId', 'description'])
  private readonly _validation?: never;
}
