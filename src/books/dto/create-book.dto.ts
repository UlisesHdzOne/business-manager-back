import { IsBoolean, IsString, Length } from 'class-validator';

export class CreateBookDto {
  @IsString()
  @Length(2, 50)
  title!: string;

  @IsString()
  @Length(2, 50)
  author!: string;

  @IsBoolean()
  available!: boolean;
}
