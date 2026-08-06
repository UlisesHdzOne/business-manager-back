import { ErrorCode } from './error-codes';

export const ErrorMessages: Record<ErrorCode, string> = {
  [ErrorCode.NOT_FOUND]: 'Registro no encontrado',
  [ErrorCode.DUPLICATE_RESOURCE]: 'Dato duplicado',
  [ErrorCode.DATABASE_ERROR]: 'Error en base de datos',
};
