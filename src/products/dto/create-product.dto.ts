import { Transform, Type } from 'class-transformer';
import {
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Matches,
  Min,
} from 'class-validator';

export class CreateProductDto {
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString({ message: 'El name debe ser texto' })
  @Length(2, 100, {
    message: 'El name debe tener entre 2 y 100 caracteres',
  })
  @Matches(/^[A-Za-záéíóúñÑ0-9\s]+$/, {
    message: 'El name solo puede contener letras, números y espacios',
  })
  name!: string;

  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsOptional()
  @IsString({ message: 'La description debe ser texto' })
  @Length(2, 255, {
    message: 'La description debe tener entre 2 y 255 caracteres',
  })
  description?: string;

  @Type(() => Number)
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'El price debe ser un número válido con máximo 2 decimales' },
  )
  @Min(0.01, {
    message: 'El price debe ser mayor a 0',
  })
  price!: number;

  @Type(() => Number)
  @IsInt({ message: 'El stock debe ser un número entero' })
  @Min(0, {
    message: 'El stock no puede ser negativo',
  })
  stock!: number;

  @IsUUID('4', {
    message: 'El categoryId debe ser un UUID válido',
  })
  categoryId!: string;
}
