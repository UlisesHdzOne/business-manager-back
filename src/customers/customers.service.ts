import { PrismaService } from '@/prisma/prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CustomersService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.customer.findMany();
  }
}
