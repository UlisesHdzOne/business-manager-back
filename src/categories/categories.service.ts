import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { plainToInstance } from 'class-transformer';
import { CategoryResponseDto } from './dto/category-response.dto';
import { CategoryQueryDto } from './dto/category-query.dto';

const categorySelect = {
  id: true,
  name: true,
  description: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.CategorySelect;

type CategoryResponseInput = Prisma.CategoryGetPayload<{
  select: typeof categorySelect;
}>;

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  private toResponse(category: CategoryResponseInput): CategoryResponseDto {
    return plainToInstance(CategoryResponseDto, category, {
      excludeExtraneousValues: true,
    });
  }

  private buildWhere(query: CategoryQueryDto): Prisma.CategoryWhereInput {
    const where: Prisma.CategoryWhereInput = {};

    if (query.isActive !== undefined) {
      where.isActive = query.isActive;
    }

    if (query.name) {
      where.name = {
        contains: query.name,
        mode: 'insensitive',
      };
    }

    return where;
  }

  private buildOrderBy(
    query: CategoryQueryDto,
  ): Prisma.CategoryOrderByWithRelationInput {
    return {
      [query.sortBy]: query.order,
    };
  }

  async create(createCategoryDto: CreateCategoryDto) {
    const category = await this.prisma.category.create({
      data: createCategoryDto,
      select: categorySelect,
    });

    return this.toResponse(category);
  }

  async findAll(query: CategoryQueryDto) {
    const { page, limit } = query;

    const where = this.buildWhere(query);
    const orderBy = this.buildOrderBy(query);

    const [categories, total] = await Promise.all([
      this.prisma.category.findMany({
        select: categorySelect,
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.category.count({
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

    const categoriesResponse = categories.map((category) =>
      this.toResponse(category),
    );

    return { categories: categoriesResponse, meta };
  }

  async findOne(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      select: categorySelect,
    });
    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return this.toResponse(category);
  }
}
