import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

type ErrorResponseShape = {
  message?: string | string[];
  code?: string;
  field?: string;
};

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Error interno del servidor';
    let code: string | undefined;
    let field: string | undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();

      const res = exception.getResponse();

      if (typeof res === 'object' && res !== null) {
        const data = res as ErrorResponseShape;

        if (Array.isArray(data.message)) {
          message = data.message.join(', ');
        } else if (typeof data.message === 'string') {
          message = data.message;
        }

        code = data.code;
        field = data.field;
      } else if (typeof res === 'string') {
        message = res;
      }
    }

    response.status(status).json({
      success: false,
      message,
      ...(code && { code }),
      ...(field && { field }),
      timestamp: new Date().toISOString(),
    });
  }
}
