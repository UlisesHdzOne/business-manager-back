import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

@ValidatorConstraint({ name: 'atLeastOne', async: false })
export class AtLeastOneValidator implements ValidatorConstraintInterface {
  validate(_: unknown, args: ValidationArguments): boolean {
    const object = args.object as Record<string, unknown>;
    const properties = args.constraints[0] as string[];

    return properties.some((property) => {
      const value = object[property];

      return value !== undefined && value !== null && value !== '';
    });
  }

  defaultMessage(): string {
    return 'At least one field must be provided';
  }
}