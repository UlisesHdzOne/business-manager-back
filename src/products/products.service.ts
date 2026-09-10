import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { ProductResponseDto } from './dto/product-response.dto';
import { plainToInstance } from 'class-transformer';
import { ProductQueryDto } from './dto/product-query.dto';

const productSelect = {
  id: true,
  name: true,
  description: true,
  price: true,
  stock: true,
  isActive: true,
  categoryId: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.ProductSelect;

type ProductResponseInput = Prisma.ProductGetPayload<{
  select: typeof productSelect;
}>;

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  private toResponse(product: ProductResponseInput): ProductResponseDto {
    return plainToInstance(
      ProductResponseDto,
      {
        ...product,
        price: Number(product.price),
      },
      {
        excludeExtraneousValues: true,
      },
    );
  }

  private buildWhere(query: ProductQueryDto): Prisma.ProductWhereInput {
    const where: Prisma.ProductWhereInput = {};

    if (query.isActive !== undefined) {
      where.isActive = query.isActive;
    }

    if (query.name) {
      where.name = {
        contains: query.name,
        mode: 'insensitive',
      };
    }

    if (query.categoryId) {
      where.categoryId = query.categoryId;
    }

    return where;
  }

  private buildOrderBy(
    query: ProductQueryDto,
  ): Prisma.ProductOrderByWithRelationInput {
    return {
      [query.sortBy]: query.order,
    };
  }

  async create(createProductDto: CreateProductDto) {
    const category = await this.prisma.category.findUnique({
      where: { id: createProductDto.categoryId },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    if (!category.isActive) {
      throw new BadRequestException('Category is inactive');
    }

    const product = await this.prisma.product.create({
      data: createProductDto,
      select: productSelect,
    });
    return this.toResponse(product);
  }

  async findAll(query: ProductQueryDto) {
    const { page, limit } = query;

    const where = this.buildWhere(query);
    const orderBy = this.buildOrderBy(query);

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        select: productSelect,
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.product.count({
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

    const productResponse = products.map((product) => this.toResponse(product));
    return { products: productResponse, meta };
  }
}
