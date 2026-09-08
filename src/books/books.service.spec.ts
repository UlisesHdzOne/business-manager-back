import { BooksService } from './books.service';
import { Test } from '@nestjs/testing';
import { PrismaService } from '@/prisma/prisma.service';
import { SortOrder } from '@/common/enum/sort-order.enum';
import { BookSortBy } from './enums/book-sort-by.enum';

describe('BooksService', () => {
  let service: BooksService;

  let prisma: {
    book: {
      findFirst: jest.Mock;
      findMany: jest.Mock;
      count: jest.Mock;
      create: jest.Mock;
      findUnique: jest.Mock;
      update: jest.Mock;
    };
    author: {
      findUnique: jest.Mock;
    };
    loan: {
      findFirst: jest.Mock;
    };
  };

  const book = {
    id: '123',
    title: 'Clean Code',
    authorId: 'author-123',
    isActive: true,
    isAvailableForLoan: true,
    description: 'Libro sobre buenas prácticas',
    inactiveReason: null,
  };

  beforeEach(async () => {
    prisma = {
      book: {
        findFirst: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
        create: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      author: {
        findUnique: jest.fn(),
      },
      loan: {
        findFirst: jest.fn(),
      },
    };

    const module = await Test.createTestingModule({
      providers: [
        BooksService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    service = module.get<BooksService>(BooksService);
  });

  // ==========================================
  // findOne
  // ==========================================

  describe('findOne', () => {
    it('debería devolver un libro si existe', async () => {
      prisma.book.findFirst.mockResolvedValue(book);

      const result = await service.findOne('123');

      expect(result).toEqual(book);
    });

    it('debería lanzar un error si el libro no existe', async () => {
      prisma.book.findFirst.mockResolvedValue(null);

      await expect(service.findOne('123')).rejects.toThrow('Book not found');
    });
  });

  // ==========================================
  // findAll
  // ==========================================

  describe('findAll', () => {
    const query = {
      page: 1,
      limit: 10,
      order: SortOrder.ASC,
      sortBy: BookSortBy.CREATED_AT,
    };

    it('debería devolver los libros y la metadata', async () => {
      prisma.book.findMany.mockResolvedValue([
        book,
        {
          ...book,
          id: '124',
          title: 'Clean Code 2',
          authorId: 'author-124',
        },
      ]);

      prisma.book.count.mockResolvedValue(2);

      const result = await service.findAll(query);

      expect(result.books).toHaveLength(2);

      expect(result.meta).toEqual({
        total: 2,
        page: 1,
        limit: 10,
        lastPage: 1,
      });
    });

    it('debería filtrar los libros por estado activo', async () => {
      prisma.book.findMany.mockResolvedValue([]);
      prisma.book.count.mockResolvedValue(0);

      await service.findAll({
        ...query,
        isActive: true,
      });

      expect(prisma.book.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            isActive: true,
          },
        }),
      );

      expect(prisma.book.count).toHaveBeenCalledWith({
        where: {
          isActive: true,
        },
      });
    });

    it('debería filtrar los libros por disponibilidad para préstamo', async () => {
      prisma.book.findMany.mockResolvedValue([]);
      prisma.book.count.mockResolvedValue(0);

      await service.findAll({
        ...query,
        isAvailableForLoan: true,
      });

      expect(prisma.book.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            isAvailableForLoan: true,
          },
        }),
      );
    });

    it('debería filtrar los libros por título', async () => {
      prisma.book.findMany.mockResolvedValue([]);
      prisma.book.count.mockResolvedValue(0);

      await service.findAll({
        ...query,
        title: 'clean',
      });

      expect(prisma.book.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            title: {
              contains: 'clean',
              mode: 'insensitive',
            },
          },
        }),
      );
    });

    it('debería aplicar ordenamiento', async () => {
      prisma.book.findMany.mockResolvedValue([]);
      prisma.book.count.mockResolvedValue(0);

      await service.findAll({
        ...query,
        sortBy: BookSortBy.TITLE,
        order: SortOrder.DESC,
      });

      expect(prisma.book.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: {
            [BookSortBy.TITLE]: SortOrder.DESC,
          },
        }),
      );
    });

    it('debería aplicar paginación', async () => {
      prisma.book.findMany.mockResolvedValue([]);
      prisma.book.count.mockResolvedValue(25);

      await service.findAll({
        ...query,
        page: 2,
        limit: 10,
      });

      expect(prisma.book.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 10,
          take: 10,
        }),
      );

      expect(prisma.book.count).toHaveBeenCalled();

      const result = await service.findAll({
        ...query,
        page: 2,
        limit: 10,
      });

      expect(result.meta).toEqual({
        total: 25,
        page: 2,
        limit: 10,
        lastPage: 3,
      });
    });

    it('debería devolver lastPage igual a 1 cuando no existen libros', async () => {
      prisma.book.findMany.mockResolvedValue([]);
      prisma.book.count.mockResolvedValue(0);

      const result = await service.findAll(query);

      expect(result.books).toHaveLength(0);

      expect(result.meta).toEqual({
        total: 0,
        page: 1,
        limit: 10,
        lastPage: 1,
      });
    });
  });

  // ==========================================
  // create
  // ==========================================

  describe('create', () => {
    const dto = {
      title: 'Clean Code',
      authorId: 'author-123',
      description: 'Libro sobre buenas prácticas',
    };

    it('debería crear un libro si el autor está activo', async () => {
      prisma.author.findUnique.mockResolvedValue({
        id: 'author-123',
      });

      prisma.book.create.mockResolvedValue(book);

      const result = await service.create(dto);

      expect(result).toEqual(book);

      expect(prisma.book.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: dto,
        }),
      );
    });

    it('debería lanzar un error si el autor no existe o está inactivo', async () => {
      prisma.author.findUnique.mockResolvedValue(null);

      await expect(service.create(dto)).rejects.toThrow('Author not found');

      expect(prisma.book.create).not.toHaveBeenCalled();
    });
  });

  // ==========================================
  // update
  // ==========================================

  describe('update', () => {
    const dto = {
      title: 'Clean Code Updated',
    };

    it('debería actualizar un libro inactivo', async () => {
      prisma.book.findUnique.mockResolvedValue({
        ...book,
        isActive: false,
      });

      prisma.book.update.mockResolvedValue({
        ...book,
        title: 'Clean Code Updated',
        isActive: false,
      });

      const result = await service.update('123', dto);

      expect(result).toEqual({
        ...book,
        title: 'Clean Code Updated',
        isActive: false,
      });

      expect(prisma.book.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            id: '123',
          },
          data: dto,
        }),
      );
    });

    it('debería lanzar un error si el libro no existe', async () => {
      prisma.book.findUnique.mockResolvedValue(null);

      await expect(service.update('123', dto)).rejects.toThrow(
        'Book not found',
      );

      expect(prisma.book.update).not.toHaveBeenCalled();
    });

    it('debería lanzar un error si el libro está activo', async () => {
      prisma.book.findUnique.mockResolvedValue({
        ...book,
        isActive: true,
      });

      await expect(service.update('123', dto)).rejects.toThrow(
        'Book must be inactive to update',
      );

      expect(prisma.book.update).not.toHaveBeenCalled();
    });

    it('debería validar que el nuevo autor esté activo', async () => {
      prisma.book.findUnique.mockResolvedValue({
        ...book,
        isActive: false,
      });

      prisma.author.findUnique.mockResolvedValue(null);

      await expect(
        service.update('123', {
          authorId: 'author-999',
        }),
      ).rejects.toThrow('Author not found');

      expect(prisma.book.update).not.toHaveBeenCalled();
    });

    it('debería actualizar el autor si el nuevo autor está activo', async () => {
      prisma.book.findUnique.mockResolvedValue({
        ...book,
        isActive: false,
      });

      prisma.author.findUnique.mockResolvedValue({
        id: 'author-999',
      });

      prisma.book.update.mockResolvedValue({
        ...book,
        authorId: 'author-999',
        isActive: false,
      });

      const result = await service.update('123', {
        authorId: 'author-999',
      });

      expect(result).toEqual({
        ...book,
        authorId: 'author-999',
        isActive: false,
      });

      expect(prisma.book.update).toHaveBeenCalled();
    });
  });

  // ==========================================
  // deactivate
  // ==========================================

  describe('deactivate', () => {
    it('debería lanzar un error si el libro no existe', async () => {
      prisma.book.findUnique.mockResolvedValue(null);

      await expect(service.deactivate('123')).rejects.toThrow('Book not found');

      expect(prisma.book.update).not.toHaveBeenCalled();
    });

    it('debería lanzar un error si el libro ya está inactivo', async () => {
      prisma.book.findUnique.mockResolvedValue({
        id: '123',
        isActive: false,
      });

      await expect(service.deactivate('123')).rejects.toThrow(
        'Book is already inactive',
      );

      expect(prisma.loan.findFirst).not.toHaveBeenCalled();
      expect(prisma.book.update).not.toHaveBeenCalled();
    });

    it('debería lanzar un error si el libro tiene un préstamo activo', async () => {
      prisma.book.findUnique.mockResolvedValue({
        id: '123',
        isActive: true,
      });

      prisma.loan.findFirst.mockResolvedValue({
        id: 'loan-123',
      });

      await expect(service.deactivate('123')).rejects.toThrow(
        'Book cannot be deactivated because it is currently on loan',
      );

      expect(prisma.book.update).not.toHaveBeenCalled();
    });

    it('debería desactivar el libro correctamente', async () => {
      prisma.book.findUnique.mockResolvedValue({
        id: '123',
        isActive: true,
      });

      prisma.loan.findFirst.mockResolvedValue(null);

      prisma.book.update.mockResolvedValue({
        ...book,
        isActive: false,
        inactiveReason: 'MANUAL',
      });

      await service.deactivate('123');

      expect(prisma.book.update).toHaveBeenCalledWith({
        where: {
          id: '123',
        },
        data: {
          isActive: false,
          inactiveReason: 'MANUAL',
        },
      });
    });
  });
});
