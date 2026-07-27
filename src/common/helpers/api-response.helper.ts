import { ApiResponse } from '../interfaces/api-response.interface';

export function successResponse<T>(data: T, message: string): ApiResponse<T> {
  return {
    success: true,
    message,
    data,
  };
}
