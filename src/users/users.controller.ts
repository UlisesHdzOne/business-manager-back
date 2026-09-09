import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  Param,
  Patch,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UserQueryDto } from './dto/user-query.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { CurrentUser } from '@/auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '@/auth/interfaces/authenticated-user.interface';
import { RolesGuard } from '@/auth/guards/roles.guard';
import { UserRole } from '@prisma/client';
import { Roles } from '@/auth/decorators/roles.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get()
  findAll(@Query() query: UserQueryDto) {
    return this.usersService.findAll(query);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    if (user.role !== UserRole.ADMIN && user.id !== id) {
      throw new ForbiddenException('You can only access your own user');
    }

    return this.usersService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    if (user.role !== UserRole.ADMIN && user.id !== id) {
      throw new ForbiddenException('You can only update your own user');
    }

    return this.usersService.update(id, updateUserDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch(':id/deactivate')
  deactivate(@Param('id') id: string) {
    return this.usersService.deactivate(id);
  }
}
