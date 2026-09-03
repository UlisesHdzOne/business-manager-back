import { PrismaService } from '@/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { BookQueryDto } from './dto/book-query.dto';
import { BookResponseDto } from './dto/book-response.dto';
import { PaginationMeta } from '@/common/dto/pagination-meta.type';

const bookSelect = {
  id: true,
  title: true,
  authorId: true,
  isActive: true,
  isAvailableForLoan: true,
  description: true,
  inactiveReason: true,
} satisfies Prisma.BookSelect;

type BookResponseInput = Prisma.BookGetPayload<{
  select: typeof bookSelect;
}>;

@Injectable()
export class BooksService {
  constructor(private readonly prisma: PrismaService) {}

  private buildWhere(query: BookQueryDto): Prisma.BookWhereInput {
    const { isActive, isAvailableForLoan, title } = query;

    const where: Prisma.BookWhereInput = {};

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    if (isAvailableForLoan !== undefined) {
      where.isAvailableForLoan = isAvailableForLoan;
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

  private async findActiveAuthor(id: string): Promise<{ id: string } | null> {
    return this.prisma.author.findUnique({
      where: {
        id,
        isActive: true,
      },
      select: {
        id: true,
      },
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
    const author = await this.findActiveAuthor(dto.authorId);

    if (!author) {
      throw new NotFoundException('Author not found');
    }

    const book = await this.prisma.book.create({
      data: dto,
      select: bookSelect,
    });
    return this.toResponse(book);
  }

  async findOne(id: string): Promise<BookResponseDto> {
    const book = await this.prisma.book.findFirst({
      where: {
        id,
      },
      select: bookSelect,
    });

    if (!book) {
      throw new NotFoundException('Book not found');
    }

    return this.toResponse(book);
  }

  async update(id: string, dto: UpdateBookDto): Promise<BookResponseDto> {
    const book = await this.prisma.book.findUnique({
      where: { id },
      select: bookSelect,
    });

    if (!book) {
      throw new NotFoundException('Book not found');
    }

    if (book.isActive) {
      throw new BadRequestException('Book must be inactive to update');
    }

    if (dto.authorId !== undefined) {
      const author = await this.findActiveAuthor(dto.authorId);

      if (!author) {
        throw new NotFoundException('Author not found');
      }
    }

    const updatedBook = await this.prisma.book.update({
      where: { id },
      data: dto,
      select: bookSelect,
    });

    return this.toResponse(updatedBook);
  }

  async deactivate(id: string): Promise<void> {
    const book = await this.prisma.book.findUnique({
      where: { id },
      select: {
        id: true,
        isActive: true,
      },
    });

    if (!book) {
      throw new NotFoundException('Book not found');
    }

    if (!book.isActive) {
      throw new BadRequestException('Book is already inactive');
    }

    const activeLoan = await this.prisma.loan.findFirst({
      where: {
        bookId: id,
        returnDate: null,
      },
      select: {
        id: true,
      },
    });

    if (activeLoan) {
      throw new BadRequestException(
        'Book cannot be deactivated because it is currently on loan',
      );
    }

    await this.prisma.book.update({
      where: { id },
      data: {
        isActive: false,
        inactiveReason: 'MANUAL',
      },
    });
  }
}
