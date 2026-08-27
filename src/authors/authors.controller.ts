import {
  Controller,
  Post,
  Param,
  Body,
  Get,
  Query,
  Patch,
  Delete,
  HttpCode,
  UseInterceptors,
} from '@nestjs/common';
import { AuthorsService } from './authors.service';
import { CreateAuthorDto } from './dto/create-author.dto';
import { AuthorQueryDto } from './dto/author-query.dto';
import { UpdateAuthorDto } from './dto/update-author.dto';
import { ResponseInterceptor } from '@/common/interceptors/response.interceptor';

@UseInterceptors(ResponseInterceptor)
@Controller('authors')
export class AuthorsController {
  constructor(private readonly authorsService: AuthorsService) {}

  @Post()
  create(@Body() createAuthorDto: CreateAuthorDto) {
    return this.authorsService.create(createAuthorDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.authorsService.findOne(id);
  }

  @Get()
  findAll(@Query() query: AuthorQueryDto) {
    return this.authorsService.findAll(query);
  }

  @Patch(':id/restore')
  restore(@Param('id') id: string) {
    return this.authorsService.restore(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateAuthorDto) {
    return this.authorsService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  delete(@Param('id') id: string) {
    return this.authorsService.delete(id);
  }
}
