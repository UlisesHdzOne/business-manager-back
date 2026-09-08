import { LoansService } from './loans.service';
import { Test } from '@nestjs/testing';
import { PrismaService } from '@/prisma/prisma.service';
import { SortOrder } from '@/common/enum/sort-order.enum';
import { LoanSortBy } from './enums/loan-sort-by.enum';

describe('LoansService', () => {
  let service: LoansService;

  let prisma: {
    loan: {
      findUnique: jest.Mock;
      findMany: jest.Mock;
      count: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
    };
    user: {
      findUnique: jest.Mock;
    };
    book: {
      findUnique: jest.Mock;
    };
    $transaction: jest.Mock;
  };

  const loan = {
    id: 'loan-123',
    userId: 'user-123',
    bookId: 'book-123',
    loanDate: new Date('2026-01-01'),
    returnDate: null,
  };

  beforeEach(async () => {
    prisma = {
      loan: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      user: {
        findUnique: jest.fn(),
      },
      book: {
        findUnique: jest.fn(),
      },
      $transaction: jest.fn(),
    };

    const module = await Test.createTestingModule({
      providers: [
        LoansService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    service = module.get<LoansService>(LoansService);
  });

  describe('create', () => {
    const dto = {
      userId: 'user-123',
      bookId: 'book-123',
    };

    const user = {
      id: 'user-123',
      isActive: true,
    };

    const book = {
      id: 'book-123',
      isActive: true,
      isAvailableForLoan: true,
    };

    it('debería crear un préstamo correctamente', async () => {
      prisma.user.findUnique.mockResolvedValue(user);
      prisma.book.findUnique.mockResolvedValue(book);

      const tx = {
        book: {
          updateMany: jest.fn().mockResolvedValue({
            count: 1,
          }),
        },
        loan: {
          create: jest.fn().mockResolvedValue(loan),
        },
      };

      prisma.$transaction.mockImplementation(async (callback) => {
        return callback(tx);
      });

      const result = await service.create(dto);

      expect(result).toEqual(loan);

      expect(tx.book.updateMany).toHaveBeenCalledWith({
        where: {
          id: 'book-123',
          isAvailableForLoan: true,
        },
        data: {
          isAvailableForLoan: false,
        },
      });

      expect(tx.loan.create).toHaveBeenCalledWith({
        data: {
          userId: 'user-123',
          bookId: 'book-123',
        },
      });
    });

    it('debería lanzar un error si el usuario no existe', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(service.create(dto)).rejects.toThrow('User not found');

      expect(prisma.book.findUnique).not.toHaveBeenCalled();
      expect(prisma.$transaction).not.toHaveBeenCalled();
    });

    it('debería lanzar un error si el usuario está inactivo', async () => {
      prisma.user.findUnique.mockResolvedValue({
        ...user,
        isActive: false,
      });

      await expect(service.create(dto)).rejects.toThrow('User is inactive');

      expect(prisma.book.findUnique).not.toHaveBeenCalled();
      expect(prisma.$transaction).not.toHaveBeenCalled();
    });

    it('debería lanzar un error si el libro no existe', async () => {
      prisma.user.findUnique.mockResolvedValue(user);
      prisma.book.findUnique.mockResolvedValue(null);

      await expect(service.create(dto)).rejects.toThrow('Book not found');

      expect(prisma.$transaction).not.toHaveBeenCalled();
    });

    it('debería lanzar un error si el libro está inactivo', async () => {
      prisma.user.findUnique.mockResolvedValue(user);
      prisma.book.findUnique.mockResolvedValue({
        ...book,
        isActive: false,
      });

      await expect(service.create(dto)).rejects.toThrow('Book is inactive');

      expect(prisma.$transaction).not.toHaveBeenCalled();
    });

    it('debería lanzar un error si el libro no está disponible', async () => {
      prisma.user.findUnique.mockResolvedValue(user);
      prisma.book.findUnique.mockResolvedValue(book);

      const tx = {
        book: {
          updateMany: jest.fn().mockResolvedValue({
            count: 0,
          }),
        },
        loan: {
          create: jest.fn(),
        },
      };

      prisma.$transaction.mockImplementation(async (callback) => {
        return callback(tx);
      });

      await expect(service.create(dto)).rejects.toThrow(
        'Book is not available',
      );

      expect(tx.loan.create).not.toHaveBeenCalled();
    });

    it('debería marcar el libro como no disponible antes de crear el préstamo', async () => {
      prisma.user.findUnique.mockResolvedValue(user);
      prisma.book.findUnique.mockResolvedValue(book);

      const tx = {
        book: {
          updateMany: jest.fn().mockResolvedValue({
            count: 1,
          }),
        },
        loan: {
          create: jest.fn().mockResolvedValue(loan),
        },
      };

      prisma.$transaction.mockImplementation(async (callback) => {
        return callback(tx);
      });

      await service.create(dto);

      expect(tx.book.updateMany).toHaveBeenCalledWith({
        where: {
          id: dto.bookId,
          isAvailableForLoan: true,
        },
        data: {
          isAvailableForLoan: false,
        },
      });
    });
  });

  describe('returnLoan', () => {
    it('debería devolver un préstamo correctamente', async () => {
      const activeLoan = {
        id: 'loan-123',
        bookId: 'book-123',
        returnDate: null,
      };

      const returnedLoan = {
        ...loan,
        returnDate: new Date(),
      };

      const tx = {
        loan: {
          findUnique: jest.fn().mockResolvedValue(activeLoan),
          update: jest.fn().mockResolvedValue(returnedLoan),
        },
        book: {
          update: jest.fn().mockResolvedValue({
            id: 'book-123',
            isAvailableForLoan: true,
          }),
        },
      };

      prisma.$transaction.mockImplementation(async (callback) => {
        return callback(tx);
      });

      const result = await service.returnLoan('loan-123');

      expect(result).toEqual(returnedLoan);

      expect(tx.book.update).toHaveBeenCalledWith({
        where: {
          id: 'book-123',
        },
        data: {
          isAvailableForLoan: true,
        },
      });

      expect(tx.loan.update).toHaveBeenCalledWith({
        where: {
          id: 'loan-123',
        },
        data: {
          returnDate: expect.any(Date),
        },
        select: expect.any(Object),
      });
    });

    it('debería lanzar un error si el préstamo no existe', async () => {
      const tx = {
        loan: {
          findUnique: jest.fn().mockResolvedValue(null),
          update: jest.fn(),
        },
        book: {
          update: jest.fn(),
        },
      };

      prisma.$transaction.mockImplementation(async (callback) => {
        return callback(tx);
      });

      await expect(service.returnLoan('loan-123')).rejects.toThrow(
        'Loan not found',
      );

      expect(tx.book.update).not.toHaveBeenCalled();
      expect(tx.loan.update).not.toHaveBeenCalled();
    });

    it('debería lanzar un error si el préstamo ya fue devuelto', async () => {
      const tx = {
        loan: {
          findUnique: jest.fn().mockResolvedValue({
            id: 'loan-123',
            bookId: 'book-123',
            returnDate: new Date(),
          }),
          update: jest.fn(),
        },
        book: {
          update: jest.fn(),
        },
      };

      prisma.$transaction.mockImplementation(async (callback) => {
        return callback(tx);
      });

      await expect(service.returnLoan('loan-123')).rejects.toThrow(
        'Loan is already returned',
      );

      expect(tx.book.update).not.toHaveBeenCalled();
      expect(tx.loan.update).not.toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('debería devolver un préstamo si existe', async () => {
      prisma.loan.findUnique.mockResolvedValue(loan);

      const result = await service.findOne('loan-123');

      expect(result).toEqual(loan);

      expect(prisma.loan.findUnique).toHaveBeenCalledWith({
        where: {
          id: 'loan-123',
        },
        select: expect.any(Object),
      });
    });

    it('debería lanzar un error si el préstamo no existe', async () => {
      prisma.loan.findUnique.mockResolvedValue(null);

      await expect(service.findOne('loan-123')).rejects.toThrow(
        'Loan not found',
      );
    });
  });

  describe('findAll', () => {
    const query = {
      page: 1,
      limit: 10,
      order: SortOrder.ASC,
      sortBy: LoanSortBy.LOAN_DATE,
    };

    it('debería devolver los préstamos y la metadata', async () => {
      prisma.loan.findMany.mockResolvedValue([
        loan,
        {
          ...loan,
          id: 'loan-124',
          userId: 'user-124',
          bookId: 'book-124',
        },
      ]);

      prisma.loan.count.mockResolvedValue(2);

      const result = await service.findAll(query);

      expect(result.loans).toHaveLength(2);

      expect(result.meta).toEqual({
        total: 2,
        page: 1,
        limit: 10,
        lastPage: 1,
      });
    });

    it('debería filtrar los préstamos por usuario', async () => {
      prisma.loan.findMany.mockResolvedValue([]);
      prisma.loan.count.mockResolvedValue(0);

      await service.findAll({
        ...query,
        userId: 'user-123',
      });

      expect(prisma.loan.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            userId: 'user-123',
          },
        }),
      );

      expect(prisma.loan.count).toHaveBeenCalledWith({
        where: {
          userId: 'user-123',
        },
      });
    });

    it('debería filtrar los préstamos por libro', async () => {
      prisma.loan.findMany.mockResolvedValue([]);
      prisma.loan.count.mockResolvedValue(0);

      await service.findAll({
        ...query,
        bookId: 'book-123',
      });

      expect(prisma.loan.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            bookId: 'book-123',
          },
        }),
      );
    });

    it('debería filtrar los préstamos activos', async () => {
      prisma.loan.findMany.mockResolvedValue([]);
      prisma.loan.count.mockResolvedValue(0);

      await service.findAll({
        ...query,
        active: true,
      });

      expect(prisma.loan.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            returnDate: null,
          },
        }),
      );

      expect(prisma.loan.count).toHaveBeenCalledWith({
        where: {
          returnDate: null,
        },
      });
    });

    it('debería filtrar los préstamos devueltos', async () => {
      prisma.loan.findMany.mockResolvedValue([]);
      prisma.loan.count.mockResolvedValue(0);

      await service.findAll({
        ...query,
        active: false,
      });

      expect(prisma.loan.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            returnDate: {
              not: null,
            },
          },
        }),
      );
    });

    it('debería aplicar ordenamiento', async () => {
      prisma.loan.findMany.mockResolvedValue([]);
      prisma.loan.count.mockResolvedValue(0);

      await service.findAll({
        ...query,
        sortBy: LoanSortBy.RETURN_DATE,
        order: SortOrder.DESC,
      });

      expect(prisma.loan.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: {
            [LoanSortBy.RETURN_DATE]: SortOrder.DESC,
          },
        }),
      );
    });

    it('debería aplicar paginación', async () => {
      prisma.loan.findMany.mockResolvedValue([]);
      prisma.loan.count.mockResolvedValue(25);

      const result = await service.findAll({
        ...query,
        page: 2,
        limit: 10,
      });

      expect(prisma.loan.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 10,
          take: 10,
        }),
      );

      expect(result.meta).toEqual({
        total: 25,
        page: 2,
        limit: 10,
        lastPage: 3,
      });
    });

    it('debería devolver lastPage igual a 1 cuando no existen préstamos', async () => {
      prisma.loan.findMany.mockResolvedValue([]);
      prisma.loan.count.mockResolvedValue(0);

      const result = await service.findAll(query);

      expect(result.loans).toHaveLength(0);

      expect(result.meta).toEqual({
        total: 0,
        page: 1,
        limit: 10,
        lastPage: 1,
      });
    });
  });
});