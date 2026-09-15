import { Transform } from 'class-transformer';
import { IsInt, IsUUID, Min } from 'class-validator';

export class AddCartItemDto {
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsUUID('4', {
    message: 'El productId debe ser un UUID válido',
  })
  productId!: string;

  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? Number(value) : value,
  )
  @IsInt({
    message: 'La quantity debe ser un número entero',
  })
  @Min(1, {
    message: 'La quantity debe ser mayor o igual a 1',
  })
  quantity!: number;
}
