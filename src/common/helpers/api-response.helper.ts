import { ApiResponse } from '../interfaces/api-response.interface';

export function successResponse<T, M = undefined>(
  data: T,
  message: string,
  meta?: M,
): ApiResponse<T, M> {
  return {
    success: true,
    message,
    data,
    ...(meta ? { meta } : {}),
  };
}
