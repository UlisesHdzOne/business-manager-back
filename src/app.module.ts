import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import Joi from 'joi';
import { PrismaModule } from './prisma/prisma.module';
import { BooksModule } from './books/books.module';
import { UsersModule } from './users/users.module';
import { AuthorsModule } from './authors/authors.module';
import { LoansModule } from './loans/loans.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        DATABASE_URL: Joi.string().required(),
      }),
    }),
    PrismaModule,
    BooksModule,
    UsersModule,
    AuthorsModule,
    LoansModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
