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
  P2025: {
    status: 404,
    message: ['Record not found'],
  },
};

function getUniqueConstraintField(
  exception: Prisma.PrismaClientKnownRequestError,
): string | undefined {
  const meta: unknown = exception.meta;

  if (!meta || typeof meta !== 'object') {
    return undefined;
  }

  const driverAdapterError = (meta as Record<string, unknown>)
    .driverAdapterError;

  if (!driverAdapterError || typeof driverAdapterError !== 'object') {
    return undefined;
  }

  const cause = (driverAdapterError as Record<string, unknown>).cause;

  if (!cause || typeof cause !== 'object') {
    return undefined;
  }

  const originalMessage = (cause as Record<string, unknown>).originalMessage;

  if (typeof originalMessage !== 'string') {
    return undefined;
  }

  const match = originalMessage.match(/unique constraint "([^"]+)_key"/);

  return match?.[1]?.split('_').pop();
}

function formatUniqueConstraintMessage(field?: string): string {
  if (!field) {
    return 'A unique constraint was violated';
  }

  const formattedField = field
    .replace(/([A-Z])/g, ' $1')
    .replace(/_/g, ' ')
    .toLowerCase();

  return `The ${formattedField} already exists`;
}

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaFilter implements ExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const context = host.switchToHttp();

    const request = context.getRequest<Request>();
    const response = context.getResponse<Response>();

    if (exception.code === 'P2002') {
      const field = getUniqueConstraintField(exception);

      return sendError(request, response, 409, [
        formatUniqueConstraintMessage(field),
      ]);
    }

    const error = prismaErrors[exception.code];

    if (!error) {
      return sendError(request, response, 500, ['Internal server error']);
    }

    return sendError(request, response, error.status, error.message);
  }
}
