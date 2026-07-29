import { PrismaService } from '@/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { successResponse } from '@/common/helpers/api-response.helper';
import { ProductResponseDto } from './dto/product-response.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ApiResponse } from '@/common/interfaces/api-response.interface';
import { mapProduct, mapProducts } from './mappers/product.mapper';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    dto: CreateProductDto,
  ): Promise<ApiResponse<ProductResponseDto>> {
    const product = await this.prisma.product.create({
      data: {
        name: dto.name,
        description: dto.description,
        price: dto.price,
        stock: dto.stock,
      },
    });

    return successResponse(
      mapProduct(product),
      'Producto creado correctamente',
    );
  }

  async findAll(): Promise<ApiResponse<ProductResponseDto[]>> {
    const products = await this.prisma.product.findMany();

    return successResponse(
      mapProducts(products),
      'Productos obtenidos correctamente',
    );
  }

  async findOne(id: string): Promise<ApiResponse<ProductResponseDto>> {
    const product = await this.prisma.product.findUniqueOrThrow({
      where: { id },
    });

    return successResponse(
      mapProduct(product),
      'Producto obtenido correctamente',
    );
  }

  async update(
    id: string,
    dto: UpdateProductDto,
  ): Promise<ApiResponse<ProductResponseDto>> {
    const product = await this.prisma.product.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.price !== undefined && { price: dto.price }),
        ...(dto.stock !== undefined && { stock: dto.stock }),
      },
    });

    return successResponse(
      mapProduct(product),
      'Producto actualizado correctamente',
    );
  }

  async remove(id: string): Promise<ApiResponse<ProductResponseDto>> {
    const product = await this.prisma.product.delete({
      where: { id },
    });

    return successResponse(
      mapProduct(product),
      'Producto eliminado correctamente',
    );
  }
}
