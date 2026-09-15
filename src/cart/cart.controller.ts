import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Param,
  UseGuards,
  Delete,
} from '@nestjs/common';

import { CartService } from './cart.service';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { AuthenticatedUser } from '@/auth/interfaces/authenticated-user.interface';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { CurrentUser } from '@/auth/decorators/current-user.decorator';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

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

  @Patch('items/:productId')
  updateItem(
    @CurrentUser() user: AuthenticatedUser,
    @Param('productId') productId: string,
    @Body() updateCartItemDto: UpdateCartItemDto,
  ) {
    return this.cartService.updateItem(
      user.id,
      productId,
      updateCartItemDto.quantity,
    );
  }

  @Delete('items/:productId')
  removeItem(
    @CurrentUser() user: AuthenticatedUser,
    @Param('productId') productId: string,
  ) {
    return this.cartService.removeItem(user.id, productId);
  }

  @Delete()
  clearCart(@CurrentUser() user: AuthenticatedUser) {
    return this.cartService.clearCart(user.id);
  }
}
