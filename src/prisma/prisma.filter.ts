import { sendError } from '@/common/utils/send-error';
import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Request, Response } from 'express';

const uniqueConstraintMessages: Record<string, string> = {
  email: 'The email is already registered',
  phone: 'The phone is already registered',
};

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

  const match = originalMessage.match(/unique constraint "User_(.+?)_key"/);

  return match?.[1];
}

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaFilter implements ExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const context = host.switchToHttp();

    const request = context.getRequest<Request>();
    const response = context.getResponse<Response>();

    if (exception.code === 'P2002') {
      const field = getUniqueConstraintField(exception);

      const message =
        field && uniqueConstraintMessages[field]
          ? uniqueConstraintMessages[field]
          : 'A unique constraint was violated';

      return sendError(request, response, 409, [message]);
    }

    const error = prismaErrors[exception.code];

    if (!error) {
      return sendError(request, response, 500, ['Internal server error']);
    }

    return sendError(request, response, error.status, error.message);
  }
}
