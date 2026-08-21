import { PrismaService } from '@/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { Injectable, NotFoundException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { BookQueryDto } from './dto/book-query.dto';
import { BookResponseDto } from './dto/book-response.dto';

const bookSelect = {
  id: true,
  title: true,
  author: true,
  available: true,
} satisfies Prisma.BookSelect;

type PaginationMeta = {
  total: number;
  page: number;
  limit: number;
  lastPage: number;
};
type BookResponseInput = Prisma.BookGetPayload<{
  select: typeof bookSelect;
}>;

@Injectable()
export class BooksService {
  constructor(private readonly prisma: PrismaService) { }

  private buildWhere(query: BookQueryDto): Prisma.BookWhereInput {
    const { available, title } = query;

    const where: Prisma.BookWhereInput = {};

    if (available !== undefined) {
      where.available = available;
    }

    if (title !== undefined) {
      where.title = {
        contains: title,
        mode: 'insensitive',
      };
    }

    return where;
  }

  private buildOrderBy(
    query: BookQueryDto,
  ): Prisma.BookOrderByWithRelationInput {
    const { sortBy, order } = query;

    return {
      [sortBy]: order,
    };
  }

  private toResponse(book: BookResponseInput): BookResponseDto {
    return plainToInstance(BookResponseDto, book, {
      excludeExtraneousValues: true,
    });
  }

  async findAll(query: BookQueryDto): Promise<{
    books: BookResponseDto[];
    meta: PaginationMeta;
  }> {
    const { page, limit } = query;

    const where = this.buildWhere(query);
    const orderBy = this.buildOrderBy(query);

    const [books, total] = await Promise.all([
      this.prisma.book.findMany({
        select: bookSelect,
        orderBy,
        where,
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.book.count({
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

    const booksResponse = books.map((book) => this.toResponse(book));

    return { books: booksResponse, meta };
  }

  async create(dto: CreateBookDto): Promise<BookResponseDto> {
    const book = await this.prisma.book.create({
      data: dto,
    });
    return this.toResponse(book);
  }

  async findOne(id: string): Promise<BookResponseDto> {
    const book = await this.prisma.book.findUnique({
      where: {
        id,
      },
    });

    if (!book) {
      throw new NotFoundException('Book not found');
    }

    return this.toResponse(book);
  }

  async update(id: string, dto: UpdateBookDto): Promise<BookResponseDto> {
    const book = await this.prisma.book.update({
      where: { id },
      data: dto,
    });

    return this.toResponse(book);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.book.delete({
      where: { id },
    });
  }
}
