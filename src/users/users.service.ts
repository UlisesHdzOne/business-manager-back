import { PrismaService } from '@/prisma/prisma.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}
  findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        id,
      },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }
    return user;
  }
  async create(createUserDto: CreateUserDto) {
    return await this.prisma.user.create({
      data: createUserDto,
    });
  }
  async update(id: string, updateUserDto: UpdateUserDto) {
    return await this.prisma.user.update({
      where: { id },
      data: updateUserDto,
    });
  }

  async delete(id: string) {
    return await this.prisma.user.delete({
      where: { id },
    });
  }
}
