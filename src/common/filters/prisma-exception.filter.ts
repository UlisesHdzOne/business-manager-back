import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';

import { Prisma } from '@prisma/client';
import { Response } from 'express';
import { ApiErrorResponse } from '../interfaces/api-error-response.interface';
import { ErrorCode } from '../enums/error-code.enum';
import { PrismaErrorCode } from '../enums/prisma-error-code.enum';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();

    if (exception.code === PrismaErrorCode.RECORD_NOT_FOUND) {
      const errorResponse: ApiErrorResponse = {
        success: false,
        message: 'Registro no encontrado',
        code: ErrorCode.RESOURCE_NOT_FOUND,
      };

      return response.status(404).json(errorResponse);
    }

    if (exception.code === PrismaErrorCode.UNIQUE_CONSTRAINT) {
      const errorResponse: ApiErrorResponse = {
        success: false,
        message: 'El registro ya existe',
        code: ErrorCode.DUPLICATE_RESOURCE,
      };

      return response.status(409).json(errorResponse);
    }

    if (exception.code === PrismaErrorCode.FOREIGN_KEY_CONSTRAINT) {
      const errorResponse: ApiErrorResponse = {
        success: false,
        message: 'No se puede eliminar porque tiene registros relacionados',
        code: ErrorCode.FOREIGN_KEY_ERROR,
      };

      return response.status(400).json(errorResponse);
    }

    const errorResponse: ApiErrorResponse = {
      success: false,
      message: 'Error interno del servidor',
      code: ErrorCode.INTERNAL_SERVER_ERROR,
    };

    return response.status(500).json(errorResponse);
  }
}
