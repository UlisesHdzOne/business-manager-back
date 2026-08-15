import { PrismaService } from '@/prisma/prisma.service';
import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { normalizeName } from '@/common/utils/normalize-name';
import { normalizePhone } from '@/common/utils/normalize-phone';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        phone: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  findOne(id: string) {
    return this.prisma.user.findUniqueOrThrow({
      where: { id },
    });
  }

  async create(createUserDto: CreateUserDto) {
    const firstName = normalizeName(createUserDto.firstName);
    const lastName = normalizeName(createUserDto.lastName);
    const phone = normalizePhone(createUserDto.phone);

    return this.prisma.user.create({
      data: {
        firstName,
        lastName,
        ...(phone !== undefined && { phone }),
      },
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const firstName =
      updateUserDto.firstName !== undefined
        ? normalizeName(updateUserDto.firstName)
        : undefined;

    const lastName =
      updateUserDto.lastName !== undefined
        ? normalizeName(updateUserDto.lastName)
        : undefined;

    const phone =
      updateUserDto.phone !== undefined
        ? normalizePhone(updateUserDto.phone)
        : undefined;

    const data = {
      ...(firstName !== undefined && { firstName }),
      ...(lastName !== undefined && { lastName }),
      ...(phone !== undefined && { phone }),
      ...(updateUserDto.phone === null && { phone: null }),
    };

    if (Object.keys(data).length === 0) {
      throw new BadRequestException(
        'Debe enviar al menos un campo para actualizar',
      );
    }

    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  delete(id: string) {
    return this.prisma.user.delete({
      where: { id },
    });
  }
}
