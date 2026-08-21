import { sendError } from '@/common/utils/send-error';
import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Request, Response } from 'express';

const prismaErrors: Record<
  string,
  {
    status: number;
    message: string[];
  }
> = {
  P2002: {
    status: 409,
    message: ['A unique constraint was violated'],
  },
  P2025: {
    status: 404,
    message: ['Record not found'],
  },
};

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaFilter implements ExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const context = host.switchToHttp();

    const request = context.getRequest<Request>();
    const response = context.getResponse<Response>();

    const error = prismaErrors[exception.code];

    if (!error) {
      return sendError(request, response, 500, ['Internal server error']);
    }

    return sendError(request, response, error.status, error.message);
  }
}
