import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';

import { Prisma } from '@prisma/client';
import { Response } from 'express';
import { ApiErrorResponse } from '../interfaces/api-error-response.interface';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();

    switch (exception.code) {
      case 'P2025': {
        const errorResponse: ApiErrorResponse = {
          success: false,
          message: 'Registro no encontrado',
          code: 'RESOURCE_NOT_FOUND',
        };

        return response.status(404).json(errorResponse);
      }

      default: {
        const errorResponse: ApiErrorResponse = {
          success: false,
          message: 'Error interno del servidor',
          code: 'INTERNAL_SERVER_ERROR',
        };

        return response.status(500).json(errorResponse);
      }
    }
  }
}
