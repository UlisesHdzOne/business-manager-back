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
}
