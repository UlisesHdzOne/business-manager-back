import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

export function handlePrismaError(error: unknown): never {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    // 🔴 Not found
    if (error.code === 'P2025') {
      throw new NotFoundException('Usuario no encontrado');
    }

    // 🔴 Unique constraint
    if (error.code === 'P2002') {
      let fieldName = 'dato';
      const meta = error.meta;

      if (meta && typeof meta === 'object') {
        // ✅ Prisma normal
        if ('target' in meta) {
          const target = (meta as { target?: unknown }).target;

          if (Array.isArray(target)) {
            fieldName = target.join(', ');
          } else if (typeof target === 'string') {
            fieldName = target;
          }
        }

        // ✅ adapter-pg
        if ('driverAdapterError' in meta) {
          const driverError = (
            meta as {
              driverAdapterError?: {
                cause?: { constraint?: unknown };
              };
            }
          ).driverAdapterError;

          const constraint = driverError?.cause?.constraint;

          if (constraint) {
            if (
              typeof constraint === 'object' &&
              constraint !== null &&
              'fields' in constraint
            ) {
              const fields = (constraint as { fields?: unknown }).fields;

              if (Array.isArray(fields)) {
                fieldName = fields.join(', ');
              }
            } else if (typeof constraint === 'string') {
              fieldName = constraint;
            }
          }
        }
      }

      throw new BadRequestException({
        message: 'Dato duplicado',
        field: fieldName,
      });
    }
  }

  throw error;
}
