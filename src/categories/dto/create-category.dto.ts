import { Transform } from 'class-transformer';
import { IsOptional, IsString, Length, Matches } from 'class-validator';

export class CreateCategoryDto {
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString({ message: 'El name debe ser texto' })
  @Length(2, 50, {
    message: 'El name debe tener entre 2 y 50 caracteres',
  })
  @Matches(/^[A-Za-záéíóúñÑ\s]+$/, {
    message: 'El name solo puede contener letras y espacios',
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
}
