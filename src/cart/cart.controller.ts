import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';

import { CartService } from './cart.service';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { AuthenticatedUser } from '@/auth/interfaces/authenticated-user.interface';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { CurrentUser } from '@/auth/decorators/current-user.decorator';

@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  getCart(@CurrentUser() user: AuthenticatedUser) {
    return this.cartService.getCart(user.id);
  }

  @Post('items') addItem(
    @CurrentUser() user: AuthenticatedUser,
    @Body() addCartItemDto: AddCartItemDto,
  ) {
    return this.cartService.addItem(
      user.id,
      addCartItemDto.productId,
      addCartItemDto.quantity,
    );
  }
}
