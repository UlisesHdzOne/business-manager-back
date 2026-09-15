import { Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { CurrentUser } from '@/auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '@/auth/interfaces/authenticated-user.interface';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  getOrders(@CurrentUser() user: AuthenticatedUser) {
    return this.ordersService.getOrders(user.id);
  }

  @Get(':id')
  getOrderById(
    @Param('id') orderId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.ordersService.getOrderById(user.id, orderId);
  }

  @Post()
  createOrder(@CurrentUser() user: AuthenticatedUser) {
    return this.ordersService.createOrder(user.id);
  }
}
