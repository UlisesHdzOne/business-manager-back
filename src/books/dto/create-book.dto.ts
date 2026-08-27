import { IsBoolean, IsString, IsUUID, Length, Matches } from 'class-validator';

export class CreateBookDto {
  @IsString({ message: 'El titulo debe ser texto' })
  @Length(2, 50, { message: 'El titulo debe tener entre 2 y 50 caracteres' })
  @Matches(/^[A-Za-záéíóúñÑ\s]+$/, {
    message: 'El título solo puede contener letras y espacios',
  })
  title!: string;

  @IsUUID('4', { message: 'El authorId debe ser un UUID válido' })
  authorId!: string;

  @IsBoolean({ message: 'Disponible debe ser booleano' })
  available!: boolean;
}
