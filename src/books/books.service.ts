import { PrismaService } from '@/prisma/prisma.service';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class BooksService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.book.findMany();
  }

  async create(dto: CreateBookDto) {
    try {
      const book = await this.prisma.book.create({
        data: dto,
      });

      return book;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new BadRequestException('Book title already exists');
        }
      }
      throw error;
    }
  }

  async findOne(id: string) {
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

  async update(id: string, dto: UpdateBookDto) {
    try {
      const book = await this.prisma.book.update({
        where: { id },
        data: dto,
      });
      return book;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException('Book not found');
        }
      }
      throw error;
    }
  }

  async delete(id: string) {
    try {
      const book = await this.prisma.book.delete({
        where: { id },
      });
      return book;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException('Book not found');
        }
      }
      throw error;
    }
  }
}
