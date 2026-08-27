import { Prisma } from '@prisma/client';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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
  active: true,
} satisfies Prisma.AuthorSelect;

type AuthorResponseInput = Prisma.AuthorGetPayload<{
  select: typeof authorSelect;
}>;

@Injectable()
export class AuthorsService {
  constructor(private readonly prisma: PrismaService) {}

  private buildWhere(query: AuthorQueryDto): Prisma.AuthorWhereInput {
    const { active, name } = query;

    const where: Prisma.AuthorWhereInput = {
      active: active ?? true,
    };
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

  private async findAuthorForUpdate(
    id: string,
  ): Promise<AuthorResponseInput | null> {
    return this.prisma.author.findUnique({
      where: { id },
      select: authorSelect,
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
    const author = await this.findAuthorForUpdate(id);

    if (!author) {
      throw new NotFoundException('Author not found');
    }

    if (!author.active) {
      throw new BadRequestException('Author is inactive');
    }

    const data: Prisma.AuthorUpdateInput = {};

    if (dto.firstName !== undefined && dto.firstName !== author.firstName) {
      data.firstName = dto.firstName;
    }

    if (dto.lastName !== undefined && dto.lastName !== author.lastName) {
      data.lastName = dto.lastName;
    }

    if (dto.email !== undefined && dto.email !== author.email) {
      data.email = dto.email;
    }

    if (Object.keys(data).length === 0) {
      throw new BadRequestException('No changes detected');
    }

    const updatedAuthor = await this.prisma.author.update({
      where: { id },
      data,
      select: authorSelect,
    });

    return this.toResponse(updatedAuthor);
  }

  async delete(id: string): Promise<void> {
    const author = await this.prisma.author.findUnique({
      where: { id },
      select: {
        id: true,
        active: true,
      },
    });

    if (!author) {
      throw new NotFoundException('Author not found');
    }

    if (!author.active) {
      throw new BadRequestException('Author is already inactive');
    }

    await this.prisma.$transaction([
      this.prisma.author.update({
        where: { id },
        data: {
          active: false,
        },
      }),

      this.prisma.book.updateMany({
        where: {
          authorId: id,
          active: true,
        },
        data: {
          active: false,
          inactiveReason: 'AUTHOR_INACTIVE',
        },
      }),
    ]);
  }

  async restore(id: string): Promise<AuthorResponseDto> {
    const author = await this.prisma.author.findUnique({
      where: { id },
      select: authorSelect,
    });

    if (!author) {
      throw new NotFoundException('Author not found');
    }

    if (author.active) {
      throw new BadRequestException('Author is already active');
    }

    await this.prisma.$transaction([
      this.prisma.author.update({
        where: { id },
        data: {
          active: true,
        },
      }),

      this.prisma.book.updateMany({
        where: {
          authorId: id,
          inactiveReason: 'AUTHOR_INACTIVE',
        },
        data: {
          active: true,
          inactiveReason: null,
        },
      }),
    ]);

    const restoredAuthor = await this.prisma.author.findUnique({
      where: { id },
      select: authorSelect,
    });

    return this.toResponse(restoredAuthor!);
  }
}
