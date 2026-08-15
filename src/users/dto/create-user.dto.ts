import {
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(50)
  @Matches(/^[a-zA-ZÁÉÍÓÚáéíóúñÑ\s]+$/, {
    message: 'Nombre inválido',
  })
  firstName!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(50)
  @Matches(/^[a-zA-ZÁÉÍÓÚáéíóúñÑ\s]+$/, {
    message: 'Apellido inválido',
  })
  lastName!: string;

  @IsString()
  @IsOptional()
  @Matches(/^\+?\d[\d\s-]{9,14}$/, {
    message: 'Formato de teléfono inválido',
  })
  phone?: string | null;
}
