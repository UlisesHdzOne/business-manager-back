import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { Response } from 'express';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();

    switch (exception.code) {
      case 'P2025':
        return response.status(404).json({
          success: false,
          message: 'Registro no encontrado',
          code: 'RESOURCE_NOT_FOUND',
        });

      default:
        return response.status(500).json({
          success: false,
          message: 'Error interno del servidor',
          code: 'INTERNAL_SERVER_ERROR',
        });
    }
  }
}
