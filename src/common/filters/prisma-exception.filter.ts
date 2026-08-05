import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  catch(error: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    switch (error.code) {
      case 'P2025':
        throw new NotFoundException({
          message: 'Registro no encontrado',
          code: error.code,
        });

      case 'P2002': {
        let field = 'dato';
        const meta = error.meta;

        if (meta && typeof meta === 'object') {
          // Prisma normal
          if ('target' in meta) {
            const target = (meta as { target?: unknown }).target;

            if (Array.isArray(target)) {
              field = target.join(', ');
            } else if (typeof target === 'string') {
              field = target;
            }
          }

          // Prisma adapter-pg
          if ('driverAdapterError' in meta) {
            const driverError = (
              meta as {
                driverAdapterError?: {
                  cause?: {
                    constraint?: unknown;
                  };
                };
              }
            ).driverAdapterError;

            const constraint = driverError?.cause?.constraint;

            if (
              constraint &&
              typeof constraint === 'object' &&
              'fields' in constraint
            ) {
              const fields = (constraint as { fields?: unknown }).fields;

              if (Array.isArray(fields)) {
                field = fields.join(', ');
              }
            }
          }
        }

        throw new BadRequestException({
          message: 'Dato duplicado',
          field,
          code: error.code,
        });
      }

      default:
        throw new BadRequestException({
          message: 'Error en base de datos',
          code: error.code,
        });
    }
  }
}
