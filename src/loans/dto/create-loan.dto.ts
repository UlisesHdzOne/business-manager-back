import { IsUUID } from 'class-validator';

export class CreateLoanDto {
  @IsUUID('4', { message: 'El userId debe ser un UUID válido' })
  userId!: string;

  @IsUUID('4', { message: 'El bookId debe ser un UUID válido' })
  bookId!: string;
}
