import { PartialType } from '@nestjs/mapped-types';
import { CreateProductDto } from './create-product.dto';
import { AtLeastOne } from '@/common/decorators/at-least-one.decorator';

export class UpdateProductDto extends PartialType(CreateProductDto) {
  @AtLeastOne(['name', 'description', 'price', 'stock', 'categoryId'])
  private readonly _validation?: never;
}
