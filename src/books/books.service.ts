import { PrismaService } from '@/prisma/prisma.service';
import { Book, Prisma } from '@prisma/client';
import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { BookQueryDto } from './dto/book-query.dto';

const bookSelect = {
  id: true,
  title: true,
  author: true,
  available: true,
} satisfies Prisma.BookSelect;

type BookListItem = Prisma.BookGetPayload<{
  select: typeof bookSelect;
}>;

type PaginationMeta = {
  total: number;
  page: number;
  limit: number;
  lastPage: number;
};

@Injectable()
export class BooksService {
  constructor(private readonly prisma: PrismaService) {}

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

  async findAll(query: BookQueryDto): Promise<{
    books: BookListItem[];
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
    const lastPage = Math.ceil(total / limit);

    const meta = {
      total,
      page,
      limit,
      lastPage,
    };

    return { books, meta };
  }

  create(dto: CreateBookDto): Promise<Book> {
    return this.prisma.book.create({
      data: dto,
    });
  }

  async findOne(id: string): Promise<Book> {
    const book = await this.prisma.book.findUnique({
      where: {
        id,
      },
    });

    if (!book) {
      throw new NotFoundException('Book not found');
    }

    return book;
  }

  update(id: string, dto: UpdateBookDto): Promise<Book> {
    return this.prisma.book.update({
      where: { id },
      data: dto,
    });
  }

  delete(id: string): Promise<Book> {
    return this.prisma.book.delete({
      where: { id },
    });
  }
}
