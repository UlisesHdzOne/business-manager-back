import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { plainToInstance } from 'class-transformer';
import { UserResponseDto } from './dto/user-response.dto';
import * as bcrypt from 'bcrypt';
import { UserQueryDto } from './dto/user-query.dto';
import { UpdateUserDto } from './dto/update-user.dto';

const userSelect = {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
  phone: true,
  role: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;

type UserResponseInput = Prisma.UserGetPayload<{
  select: typeof userSelect;
}>;

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  private toResponse(user: UserResponseInput): UserResponseDto {
    return plainToInstance(UserResponseDto, user, {
      excludeExtraneousValues: true,
    });
  }

  private buildWhere(query: UserQueryDto): Prisma.UserWhereInput {
    const where: Prisma.UserWhereInput = {};

    if (query.isActive !== undefined) {
      where.isActive = query.isActive;
    }

    if (query.name) {
      where.OR = [
        {
          firstName: {
            contains: query.name,
            mode: 'insensitive',
          },
        },
        {
          lastName: {
            contains: query.name,
            mode: 'insensitive',
          },
        },
      ];
    }

    return where;
  }

  private buildOrderBy(
    query: UserQueryDto,
  ): Prisma.UserOrderByWithRelationInput {
    return {
      [query.sortBy]: query.order,
    };
  }

  async create(createUserDto: CreateUserDto) {
    const { password, ...userData } = createUserDto;

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await this.prisma.user.create({
      data: {
        ...userData,
        passwordHash,
      },
      select: userSelect,
    });

    return this.toResponse(user);
  }

  async findAll(query: UserQueryDto) {
    const { page, limit } = query;

    const where = this.buildWhere(query);
    const orderBy = this.buildOrderBy(query);

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        select: userSelect,
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.user.count({
        where,
      }),
    ]);
    const lastPage = Math.max(1, Math.ceil(total / limit));
    const meta = {
      total,
      page,
      limit,
      lastPage,
    };

    const usersResponse = users.map((user) => this.toResponse(user));
    return { users: usersResponse, meta };
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: userSelect,
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.toResponse(user);
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const { password, ...userData } = updateUserDto;

    const data: Prisma.UserUpdateInput = {
      ...userData,
    };

    if (password) {
      data.passwordHash = await bcrypt.hash(password, 10);
    }

    const user = await this.prisma.user.update({
      where: { id },
      data,
      select: userSelect,
    });

    return this.toResponse(user);
  }
}
