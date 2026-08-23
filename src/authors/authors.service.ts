import { Prisma } from '@prisma/client';
import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAuthorDto } from './dto/create-author.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { AuthorResponseDto } from './dto/author-response.dto';
import { plainToInstance } from 'class-transformer';
import { AuthorQueryDto } from './dto/author-query.dto';
import { PaginationMeta } from '@/common/dto/pagination-meta.type';
import { UpdateAuthorDto } from './dto/update-author.dto';

const authorSelect = {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
} satisfies Prisma.AuthorSelect;

type AuthorResponseInput = Prisma.AuthorGetPayload<{
  select: typeof authorSelect;
}>;

@Injectable()
export class AuthorsService {
  constructor(private readonly prisma: PrismaService) {}

  private buildWhere(query: AuthorQueryDto): Prisma.AuthorWhereInput {
    const { active, name } = query;

    const where: Prisma.AuthorWhereInput = {};

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
    query: AuthorQueryDto,
  ): Prisma.AuthorOrderByWithRelationInput {
    const { sortBy, order } = query;

    return {
      [sortBy]: order,
    };
  }

  private toResponse(author: AuthorResponseInput): AuthorResponseDto {
    return plainToInstance(AuthorResponseDto, author, {
      excludeExtraneousValues: true,
    });
  }

  async create(dto: CreateAuthorDto): Promise<AuthorResponseDto> {
    const author = await this.prisma.author.create({
      data: dto,
      select: authorSelect,
    });
    return this.toResponse(author);
  }

  async findOne(id: string): Promise<AuthorResponseDto> {
    const author = await this.prisma.author.findUnique({
      where: { id },
      select: authorSelect,
    });

    if (!author) {
      throw new NotFoundException('Author not found');
    }

    return this.toResponse(author);
  }

  async findAll(
    query: AuthorQueryDto,
  ): Promise<{ authors: AuthorResponseDto[]; meta: PaginationMeta }> {
    const { page, limit } = query;

    const where = this.buildWhere(query);
    const orderBy = this.buildOrderBy(query);

    const [authors, total] = await Promise.all([
      this.prisma.author.findMany({
        select: authorSelect,
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.author.count({ where }),
    ]);

    const lastPage = Math.max(1, Math.ceil(total / limit));

    const meta = {
      total,
      page,
      limit,
      lastPage,
    };
    const authorsResponse = authors.map((author) => this.toResponse(author));
    return { authors: authorsResponse, meta };
  }

  async update(id: string, dto: UpdateAuthorDto): Promise<AuthorResponseDto> {
    const author = await this.prisma.author.update({
      where: { id },
      data: dto,
      select: authorSelect,
    });
    return this.toResponse(author);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.author.delete({ where: { id } });
  }
}
