import { Test } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '@/prisma/prisma.service';
import { SortOrder } from '@/common/enum/sort-order.enum';
import { UserSortBy } from './enums/user-sort-by.enum';

describe('UsersService', () => {
  let service: UsersService;
  let prisma: {
    user: {
      findUnique: jest.Mock;
      create: jest.Mock;
      findMany: jest.Mock;
      count: jest.Mock;
      update: jest.Mock;
    };
    loan: {
      findFirst: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
        update: jest.fn(),
      },
      loan: {
        findFirst: jest.fn(),
      },
    };

    const module = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('debería devolver un usuario si existe', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: '123',
      firstName: 'Ulises',
      lastName: 'Hernández',
      email: 'ulises@example.com',
      phone: '9611234567',
      isActive: true,
    });

    const user = await service.findOne('123');

    expect(user.id).toBe('123');
  });

  it('debería buscar el usuario por su id', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: '123',
      firstName: 'Ulises',
      lastName: 'Hernández',
      email: 'ulises@example.com',
      phone: '9611234567',
      isActive: true,
    });

    await service.findOne('123');

    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: {
        id: '123',
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        isActive: true,
      },
    });
  });

  it('debería lanzar un error si el usuario no existe', async () => {
    prisma.user.findUnique.mockResolvedValue(null);

    await expect(service.findOne('999')).rejects.toThrow('User not found');
  });

  it('debería devolver un usuario creado', async () => {
    prisma.user.create.mockResolvedValue({
      id: '123',
      firstName: 'Ulises',
      lastName: 'Hernández',
      email: 'ulises@example.com',
      phone: '9611234567',
      isActive: true,
    });

    const dto = {
      firstName: 'Ulises',
      lastName: 'Hernández',
      email: 'ulises@example.com',
      phone: '9611234567',
    };

    const user = await service.create(dto);

    expect(user.id).toBe('123');
  });

  it('debería devolver un usuario creado v2', async () => {
    prisma.user.create.mockResolvedValue({
      id: '123',
      firstName: 'Ulises',
      lastName: 'Hernández',
      email: 'ulises@example.com',
      phone: '9611234567',
      isActive: true,
    });

    const dto = {
      firstName: 'Ulises',
      lastName: 'Hernández',
      email: 'ulises@example.com',
      phone: '9611234567',
    };

    const user = await service.create(dto);

    expect(user).toEqual({
      id: '123',
      firstName: 'Ulises',
      lastName: 'Hernández',
      email: 'ulises@example.com',
      phone: '9611234567',
    });
  });

  it('debería crear el usuario con los datos proporcionados', async () => {
    prisma.user.create.mockResolvedValue({
      id: '123',
      firstName: 'Ulises',
      lastName: 'Hernández',
      email: 'ulises@example.com',
      phone: '9611234567',
      isActive: true,
    });

    const dto = {
      firstName: 'Ulises',
      lastName: 'Hernández',
      email: 'ulises@example.com',
      phone: '9611234567',
    };

    await service.create(dto);

    expect(prisma.user.create).toHaveBeenCalledWith({
      data: dto,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        isActive: true,
      },
    });
  });

  it('debería devolver una lista de usuarios', async () => {
    prisma.user.findMany.mockResolvedValue([
      {
        id: '123',
        firstName: 'Ulises',
        lastName: 'Hernández',
        email: 'ulises@example.com',
        phone: '9611234567',
        isActive: true,
      },
      {
        id: '1234',
        firstName: 'Jesus',
        lastName: 'Hernández',
        email: 'Jesus@example.com',
        phone: '9611234569',
        isActive: true,
      },
    ]);
    prisma.user.count.mockResolvedValue(2);

    const query = {
      page: 1,
      limit: 10,
      order: SortOrder.ASC,
      sortBy: UserSortBy.CREATED_AT,
    };

    const result = await service.findAll(query);

    expect(result.users).toHaveLength(2);
  });

  it('debería devolver el total de usuarios', async () => {
    prisma.user.findMany.mockResolvedValue([
      {
        id: '123',
        firstName: 'Ulises',
        lastName: 'Hernández',
        email: 'ulises@example.com',
        phone: '9611234567',
        isActive: true,
      },
      {
        id: '1234',
        firstName: 'Jesus',
        lastName: 'Hernández',
        email: 'Jesus@example.com',
        phone: '9611234569',
        isActive: true,
      },
    ]);

    prisma.user.count.mockResolvedValue(2);

    const query = {
      page: 1,
      limit: 10,
      order: SortOrder.ASC,
      sortBy: UserSortBy.CREATED_AT,
    };

    const result = await service.findAll(query);

    expect(result.meta.total).toBe(2);
  });

  it('debería aplicar el filtro active', async () => {
    prisma.user.findMany.mockResolvedValue([
      {
        id: '123',
        firstName: 'Ulises',
        lastName: 'Hernández',
        email: 'ulises@example.com',
        phone: '9611234567',
        isActive: true,
      },
      {
        id: '1234',
        firstName: 'Jesus',
        lastName: 'Hernández',
        email: 'Jesus@example.com',
        phone: '9611234569',
        isActive: true,
      },
    ]);

    prisma.user.count.mockResolvedValue(2);

    const query = {
      active: true,
      page: 1,
      limit: 10,
      order: SortOrder.ASC,
      sortBy: UserSortBy.CREATED_AT,
    };

    await service.findAll(query);

    expect(prisma.user.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { isActive: true } }),
    );
  });

  it('debería aplicar el filtro name', async () => {
    prisma.user.findMany.mockResolvedValue([
      {
        id: '123',
        firstName: 'Ulises',
        lastName: 'Hernández',
        email: 'ulises@example.com',
        phone: '9611234567',
        isActive: true,
      },
      {
        id: '1234',
        firstName: 'Jesus',
        lastName: 'Hernández',
        email: 'Jesus@example.com',
        phone: '9611234569',
        isActive: true,
      },
    ]);

    prisma.user.count.mockResolvedValue(2);

    const query = {
      name: 'Ulises',
      page: 1,
      limit: 10,
      order: SortOrder.ASC,
      sortBy: UserSortBy.CREATED_AT,
    };

    await service.findAll(query);

    expect(prisma.user.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          OR: [
            {
              firstName: {
                contains: 'Ulises',
                mode: 'insensitive',
              },
            },
            {
              lastName: {
                contains: 'Ulises',
                mode: 'insensitive',
              },
            },
          ],
        },
      }),
    );
  });

  it('debería aplicar el ordenamiento', async () => {
    prisma.user.findMany.mockResolvedValue([
      {
        id: '123',
        firstName: 'Ulises',
        lastName: 'Hernández',
        email: 'ulises@example.com',
        phone: '9611234567',
        isActive: true,
      },
      {
        id: '1234',
        firstName: 'Jesus',
        lastName: 'Hernández',
        email: 'Jesus@example.com',
        phone: '9611234569',
        isActive: true,
      },
    ]);

    prisma.user.count.mockResolvedValue(2);

    const query = {
      page: 1,
      limit: 10,
      order: SortOrder.ASC,
      sortBy: UserSortBy.CREATED_AT,
    };

    await service.findAll(query);

    expect(prisma.user.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: {
          createdAt: 'asc',
        },
      }),
    );
  });

  it('debería aplicar la paginación', async () => {
    prisma.user.findMany.mockResolvedValue([
      {
        id: '123',
        firstName: 'Ulises',
        lastName: 'Hernández',
        email: 'ulises@example.com',
        phone: '9611234567',
        isActive: true,
      },
      {
        id: '1234',
        firstName: 'Jesus',
        lastName: 'Hernández',
        email: 'Jesus@example.com',
        phone: '9611234569',
        isActive: true,
      },
    ]);

    prisma.user.count.mockResolvedValue(2);

    const query = {
      page: 1,
      limit: 10,
      order: SortOrder.ASC,
      sortBy: UserSortBy.CREATED_AT,
    };

    await service.findAll(query);

    expect(prisma.user.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 0,
        take: 10,
      }),
    );
  });

  it('debería devolver un arreglo vacío si no existen usuarios', async () => {
    prisma.user.findMany.mockResolvedValue([]);
    prisma.user.count.mockResolvedValue(0);

    const query = {
      page: 1,
      limit: 10,
      order: SortOrder.ASC,
      sortBy: UserSortBy.CREATED_AT,
    };

    const result = await service.findAll(query);

    expect(result.users).toEqual([]);
  });

  it('debería devolver el usuario actualizado', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: '123',
      isActive: false,
    });

    prisma.user.update.mockResolvedValue({
      id: '123',
      firstName: 'Ulises',
      lastName: 'Hernández',
      email: 'ulises@example.com',
      phone: '9611234567',
      isActive: false,
    });

    const dto = {
      firstName: 'Ulises',
      lastName: 'Hernández',
      email: 'ulises@example.com',
      phone: '9611234567',
    };

    const user = await service.update('123', dto);
    expect(user.firstName).toBe('Ulises');
  });

  it('debería lanzar un error si el usuario no existe en update', async () => {
    prisma.user.findUnique.mockResolvedValue(null);

    const dto = {
      firstName: 'Ulises',
      lastName: 'Hernández',
      email: 'ulises@example.com',
      phone: '9611234567',
    };

    await expect(service.update('123', dto)).rejects.toThrow('User not found');
  });

  it('debería actualizar el usuario con los datos proporcionados', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: '123',
      isActive: false,
    });

    prisma.user.update.mockResolvedValue({
      id: '123',
      firstName: 'Ulises',
      lastName: 'Hernández',
      email: 'ulises@example.com',
      phone: '9611234567',
      isActive: false,
    });

    const dto = {
      firstName: 'Ulises',
      lastName: 'Hernández',
      email: 'ulises@example.com',
      phone: '9611234567',
    };

    await service.update('123', dto);

    expect(prisma.user.update).toHaveBeenCalledWith({
      where: {
        id: '123',
      },
      data: dto,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        isActive: true,
      },
    });
  });

  it('debería lanzar un error si el usuario no existe en deactivate', async () => {
    prisma.user.findUnique.mockResolvedValue(null);

    await expect(service.deactivate('123')).rejects.toThrow('User not found');
  });

  it('debería rechazar la desactivación si el usuario ya está inactivo', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: '123',
      isActive: false,
    });

    await expect(service.deactivate('123')).rejects.toThrow(
      'User is already inactive',
    );
  });

  it('debería rechazar la desactivación si el usuario está activo, pero tiene un préstamo activo', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: '123',
      isActive: true,
    });

    prisma.loan.findFirst.mockResolvedValue({
      id: 'loan-123',
    });

    await expect(service.deactivate('123')).rejects.toThrow(
      'User cannot be deactivated because they have an active loan',
    );
  });

  it('debería no actualizar el usuario si tiene un préstamo activo', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: '123',
      isActive: true,
    });

    prisma.loan.findFirst.mockResolvedValue({
      id: 'loan-123',
    });

    await expect(service.deactivate('123')).rejects.toThrow(
      'User cannot be deactivated because they have an active loan',
    );

    expect(prisma.user.update).not.toHaveBeenCalled();
  });

  it('debería desactivar el usuario si está activo y no tiene préstamos activos', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: '123',
      isActive: true,
    });

    prisma.loan.findFirst.mockResolvedValue(null);

    await service.deactivate('123');

    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: '123' },
      data: {
        isActive: false,
      },
    });
  });
});
