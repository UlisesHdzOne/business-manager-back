import { CreateCustomerDto } from '../dto/create-customer.dto';
import { UpdateCustomerDto } from '../dto/update-customer.dto';
import { Prisma } from '@prisma/client';

export class CustomerMapper {
  static readonly SELECT: Prisma.CustomerSelect = {
    id: true,
    firstName: true,
    lastName: true,
  };

  static toCreate(data: CreateCustomerDto): Prisma.CustomerCreateInput {
    return {
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
    };
  }

  static toUpdate(data: UpdateCustomerDto): Prisma.CustomerUpdateInput {
    const update: Prisma.CustomerUpdateInput = {};

    if (data.firstName !== undefined) update.firstName = data.firstName.trim();
    if (data.lastName !== undefined) update.lastName = data.lastName.trim();

    return update;
  }
}
