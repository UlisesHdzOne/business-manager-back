import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { plainToInstance } from 'class-transformer';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateLoanDto } from './dto/create-loan.dto';
import { LoanResponseDto } from './dto/loan-response.dto';
import { PaginationMeta } from '@/common/dto/pagination-meta.type';
import { LoanQueryDto } from './dto/loan-query.dto';

const loanSelect = {
  id: true,
  userId: true,
  bookId: true,
  loanDate: true,
  returnDate: true,
} satisfies Prisma.LoanSelect;

type LoanResponseInput = Prisma.LoanGetPayload<{ select: typeof loanSelect }>;

@Injectable()
export class LoansService {
  constructor(private readonly prisma: PrismaService) {}

  private toResponse(loan: LoanResponseInput): LoanResponseDto {
    return plainToInstance(LoanResponseDto, loan, {
      excludeExtraneousValues: true,
    });
  }

  private buildWhere(query: LoanQueryDto): Prisma.LoanWhereInput {
    const { userId, bookId, active } = query;

    const where: Prisma.LoanWhereInput = {};

    if (userId !== undefined) {
      where.userId = userId;
    }

    if (bookId !== undefined) {
      where.bookId = bookId;
    }

    if (active !== undefined) {
      where.returnDate = active ? null : { not: null };
    }

    return where;
  }

  private buildOrderBy(
    query: LoanQueryDto,
  ): Prisma.LoanOrderByWithRelationInput {
    const { sortBy, order } = query;

    return {
      [sortBy]: order,
    };
  }

  async create(dto: CreateLoanDto): Promise<LoanResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: {
        id: dto.userId,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.isActive) {
      throw new BadRequestException('User is inactive');
    }

    const book = await this.prisma.book.findUnique({
      where: {
        id: dto.bookId,
      },
    });

    if (!book) {
      throw new NotFoundException('Book not found');
    }

    if (!book.isActive) {
      throw new BadRequestException('Book is inactive');
    }

    const loan = await this.prisma.$transaction(async (tx) => {
      const updatedBook = await tx.book.updateMany({
        where: {
          id: dto.bookId,
          isAvailableForLoan: true,
        },
        data: {
          isAvailableForLoan: false,
        },
      });

      if (updatedBook.count === 0) {
        throw new BadRequestException('Book is not available');
      }

      return tx.loan.create({
        data: {
          userId: dto.userId,
          bookId: dto.bookId,
        },
      });
    });

    return this.toResponse(loan);
  }

  async returnLoan(id: string): Promise<LoanResponseDto> {
    const returnedLoan = await this.prisma.$transaction(async (tx) => {
      const loan = await tx.loan.findUnique({
        where: { id },
        select: {
          id: true,
          bookId: true,
          returnDate: true,
        },
      });

      if (!loan) {
        throw new NotFoundException('Loan not found');
      }

      if (loan.returnDate) {
        throw new BadRequestException('Loan is already returned');
      }

      await tx.book.update({
        where: {
          id: loan.bookId,
        },
        data: {
          isAvailableForLoan: true,
        },
      });

      return tx.loan.update({
        where: {
          id,
        },
        data: {
          returnDate: new Date(),
        },
        select: loanSelect,
      });
    });

    return this.toResponse(returnedLoan);
  }

  async findAll(query: LoanQueryDto): Promise<{
    loans: LoanResponseDto[];
    meta: PaginationMeta;
  }> {
    const { page, limit } = query;

    const where = this.buildWhere(query);
    const orderBy = this.buildOrderBy(query);

    const [loans, total] = await Promise.all([
      this.prisma.loan.findMany({
        select: loanSelect,
        orderBy,
        where,
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.loan.count({
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

    const loanResponse = loans.map((loan) => this.toResponse(loan));

    return { loans: loanResponse, meta };
  }

  async findOne(id: string): Promise<LoanResponseDto> {
    const loan = await this.prisma.loan.findUnique({
      where: { id },
      select: loanSelect,
    });

    if (!loan) {
      throw new NotFoundException('Loan not found');
    }

    return this.toResponse(loan);
  }
}
