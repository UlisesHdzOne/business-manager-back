import { IsInt, Min } from 'class-validator';

export class UpdateCartItemDto {
  @IsInt({
    message: 'La quantity debe ser un número entero',
  })
  @Min(1, {
    message: 'La quantity debe ser mayor o igual a 1',
  })
  quantity!: number;
}
