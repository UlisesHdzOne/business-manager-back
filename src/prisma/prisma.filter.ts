import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Response } from 'express';

const prismaErrors: Record<
  string,
  {
    status: number;
    message: string;
  }
> = {
  P2002: {
    status: 409,
    message: 'A unique constraint was violated',
  },
  P2025: {
    status: 404,
    message: 'Record not found',
  },
};

@Catch()
export class PrismaFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();

    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      const error = prismaErrors[exception.code];

      if (!error) {
        return this.sendError(response, 500, 'Internal server error');
      }

      return this.sendError(response, error.status, error.message);
    }

    return this.sendError(response, 500, 'Internal server error');
  }

  private sendError(response: Response, status: number, message: string) {
    return response.status(status).json({
      message,
      statusCode: status,
    });
  }
}
