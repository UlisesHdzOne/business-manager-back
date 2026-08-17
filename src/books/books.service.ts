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

@Injectable()
export class BooksService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(query: BookQueryDto): Promise<BookListItem[]> {
    const { page, limit } = query;
    return this.prisma.book.findMany({
      select: bookSelect,
      orderBy: {
        createdAt: 'asc',
      },
      where: {
        available: true,
      },
      skip: (page - 1) * limit,
      take: limit,
    });
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
