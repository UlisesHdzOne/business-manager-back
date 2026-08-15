import { Injectable } from '@nestjs/common';

@Injectable()
export class BooksService {
  findAll() {
    return [
      { id: 1, title: 'html basico', author: 'nicolas', available: true },
      { id: 2, title: 'html basico 2', author: 'nicolas', available: true },
    ];
  }
}
