import { Validate } from 'class-validator';
import { AtLeastOneValidator } from '../validators/at-least-one.validator';

export function AtLeastOne(properties: string[]) {
  return Validate(AtLeastOneValidator, [properties]);
}
