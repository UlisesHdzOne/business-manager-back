import { Transform } from 'class-transformer';

export function TransformTrim() {
  return Transform(({ value }: { value: unknown }) => {
    if (typeof value !== 'string') return value;

    const name = value.trim();

    return name === '' ? undefined : name;
  });
}
