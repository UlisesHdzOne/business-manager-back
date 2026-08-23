import { IsString, Length, Matches } from 'class-validator';
import { BasePersonDto } from '@/common/dto/base-person.dto';

export class CreateUserDto extends BasePersonDto {
  @IsString({ message: 'El phone debe ser texto' })
  @Length(10, 10, {
    message: 'El phone debe tener exactamente 10 dígitos',
  })
  @Matches(/^\d{10}$/, {
    message: 'El phone solo puede contener 10 dígitos',
  })
  phone!: string;
}
