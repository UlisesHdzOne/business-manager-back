import { sendError } from '@/common/utils/send-error';
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const context = host.switchToHttp();

    const request = context.getRequest<Request>();
    const response = context.getResponse<Response>();

    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    let message: string[];

    if (typeof exceptionResponse === 'string') {
      message = [exceptionResponse];
    } else if (
      typeof exceptionResponse === 'object' &&
      exceptionResponse !== null &&
      'message' in exceptionResponse
    ) {
      const responseMessage = exceptionResponse.message;

      message = Array.isArray(responseMessage)
        ? responseMessage.map(String)
        : [String(responseMessage)];
    } else {
      message = ['An error occurred'];
    }

    return sendError(request, response, status, message);
  }
}
