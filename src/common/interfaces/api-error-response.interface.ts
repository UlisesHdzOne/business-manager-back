import { ErrorCode } from '../enums/error-code.enum';

export interface ApiErrorResponse {
  success: false;
  message: string;
  code: ErrorCode;
}
