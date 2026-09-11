import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';

import { CartService } from './cart.service';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { AuthenticatedUser } from '@/auth/interfaces/authenticated-user.interface';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  getCart(@Req() req: Request & { user: AuthenticatedUser }) {
    return this.cartService.getCart(req.user.id);
  }
}
