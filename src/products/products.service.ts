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
import { UpdateProductDto } from './dto/update-product.dto';
import {
  getPagination,
  getPaginationMeta,
} from '@/common/pagination/pagination.util';

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

  private async findActiveCategoryOrThrow(categoryId: string) {
    const category = await this.prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    if (!category.isActive) {
      throw new BadRequestException('Category is inactive');
    }

    return category;
  }

  async create(createProductDto: CreateProductDto) {
    await this.findActiveCategoryOrThrow(createProductDto.categoryId);

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
    const { skip, take } = getPagination(page, limit);

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        select: productSelect,
        where,
        orderBy,
        skip,
        take,
      }),
      this.prisma.product.count({
        where,
      }),
    ]);

    const meta = getPaginationMeta(total, page, limit);

    const productResponse = products.map((product) => this.toResponse(product));
    return { products: productResponse, meta };
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      select: productSelect,
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return this.toResponse(product);
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    if (updateProductDto.categoryId) {
      await this.findActiveCategoryOrThrow(updateProductDto.categoryId);
    }

    const product = await this.prisma.product.update({
      where: { id },
      data: updateProductDto,
      select: productSelect,
    });

    return this.toResponse(product);
  }

  async deactivate(id: string) {
    const product = await this.prisma.product.update({
      where: { id },
      data: {
        isActive: false,
      },
      select: productSelect,
    });

    return this.toResponse(product);
  }
}
