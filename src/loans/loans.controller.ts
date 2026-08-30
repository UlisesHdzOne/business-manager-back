import {
  Controller,
  Post,
  Body,
  Patch,
  Param,
  Get,
  UseInterceptors,
  Query,
} from '@nestjs/common';
import { LoansService } from './loans.service';
import { CreateLoanDto } from './dto/create-loan.dto';
import { ResponseInterceptor } from '@/common/interceptors/response.interceptor';
import { LoanQueryDto } from './dto/loan-query.dto';

@UseInterceptors(ResponseInterceptor)
@Controller('loans')
export class LoansController {
  constructor(private readonly loansService: LoansService) {}

  @Post()
  create(@Body() createLoanDto: CreateLoanDto) {
    return this.loansService.create(createLoanDto);
  }

  @Patch(':id/return')
  returnLoan(@Param('id') id: string) {
    return this.loansService.returnLoan(id);
  }

  @Get()
  findAll(@Query() query: LoanQueryDto) {
    return this.loansService.findAll(query);
  }
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.loansService.findOne(id);
  }
}
