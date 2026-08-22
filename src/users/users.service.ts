import { Prisma } from '@prisma/client';
import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { UserResponseDto } from './dto/user-response.dto';
import { plainToInstance } from 'class-transformer';
import { UserQueryDto } from './dto/user-query.dto';
import { PaginationMeta } from '@/common/dto/pagination-meta.type';
import { UpdateUserDto } from './dto/update-user.dto';

const userSelect = {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
  phone: true,
  active: true,
} satisfies Prisma.UserSelect;

type UserResponseInput = Prisma.UserGetPayload<{
  select: typeof userSelect;
}>;

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  private buildWhere(query: UserQueryDto): Prisma.UserWhereInput {
    const { active, name } = query;

    const where: Prisma.UserWhereInput = {};

    if (active !== undefined) {
      where.active = active;
    }

    if (name !== undefined) {
      where.OR = [
        {
          firstName: {
            contains: name,
            mode: 'insensitive',
          },
        },
        {
          lastName: {
            contains: name,
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
    const { sortBy, order } = query;

    return {
      [sortBy]: order,
    };
  }

  private toResponse(user: UserResponseInput): UserResponseDto {
    return plainToInstance(UserResponseDto, user, {
      excludeExtraneousValues: true,
    });
  }

  async create(dto: CreateUserDto): Promise<UserResponseDto> {
    const user = await this.prisma.user.create({
      data: dto,
      select: userSelect,
    });

    return this.toResponse(user);
  }

  async findOne(id: string): Promise<UserResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: userSelect,
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.toResponse(user);
  }

  async findAll(
    query: UserQueryDto,
  ): Promise<{ users: UserResponseDto[]; meta: PaginationMeta }> {
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

  async update(id: string, dto: UpdateUserDto): Promise<UserResponseDto> {
    const user = await this.prisma.user.update({
      where: { id },
      data: dto,
      select: userSelect,
    });
    return this.toResponse(user);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.user.delete({
      where: { id },
    });
  }
}
