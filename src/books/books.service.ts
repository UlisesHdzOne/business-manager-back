import { PrismaService } from '@/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';

@Injectable()
export class BooksService {
  constructor(private readonly prisma: PrismaService) {}
  findAll() {
    return this.prisma.book.findMany();
  }

  create(dto: CreateBookDto) {
    return this.prisma.book.create({
      data: dto,
    });
  }

  findOne(id: string) {
    return this.prisma.book.findUnique({
      where: {
        id,
      },
    });
  }

  update(id: string, dto: UpdateBookDto) {
    return this.prisma.book.update({
      where: { id },
      data: dto,
    });
  }

  delete(id: string) {
    return this.prisma.book.delete({
      where: { id },
    });
  }
}
