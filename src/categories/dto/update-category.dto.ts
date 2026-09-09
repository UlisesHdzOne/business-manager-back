import { PartialType } from '@nestjs/mapped-types';
import { CreateCategoryDto } from './create-category.dto';
import { AtLeastOne } from '@/common/decorators/at-least-one.decorator';

export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {
  @AtLeastOne(['name', 'description'])
  private readonly _validation?: never;
}
