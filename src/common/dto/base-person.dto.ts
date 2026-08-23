import { IsEmail, IsString, Length, Matches } from 'class-validator';

export class BasePersonDto {
  @IsString({ message: 'El firstName debe ser texto' })
  @Length(2, 50, {
    message: 'El firstName debe tener entre 2 y 50 caracteres',
  })
  @Matches(/^[A-Za-záéíóúñÑ\s]+$/, {
    message: 'El firstName solo puede contener letras y espacios',
  })
  firstName!: string;

  @IsString({ message: 'El lastName debe ser texto' })
  @Length(2, 50, {
    message: 'El lastName debe tener entre 2 y 50 caracteres',
  })
  @Matches(/^[A-Za-záéíóúñÑ\s]+$/, {
    message: 'El lastName solo puede contener letras y espacios',
  })
  lastName!: string;

  @IsEmail({}, { message: 'El email debe ser válido' })
  @Length(2, 50, {
    message: 'El email debe tener entre 2 y 50 caracteres',
  })
  email!: string;
}
