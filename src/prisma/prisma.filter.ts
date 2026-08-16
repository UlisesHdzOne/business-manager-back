import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Response } from 'express';

@Catch()
export class PrismaFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();

    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      // aquí sabemos que es un error conocido de Prisma
      if (exception.code === 'P2002') {
        return response.status(409).json({
          message: 'A unique constraint was violated',
          statusCode: 409,
        });
      }

      if (exception.code === 'P2025') {
        return response.status(404).json({
          message: 'Record not found',
          statusCode: 404,
        });
      }
    }

    return response.status(500).json({
      message: 'Internal server error',
      statusCode: 500,
    });
  }
}
