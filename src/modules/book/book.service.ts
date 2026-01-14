import { Injectable, NotFoundException } from '@nestjs/common';
import { BookDto } from './Dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BookService {
  constructor(private readonly prismaService: PrismaService) {}
  async createBook(bookDto: BookDto) {
    if (await this.checkCategory(bookDto.categoryId)) {
      throw new NotFoundException('Category does not exist');
    }

    const newBook = await this.prismaService.book.create({
      data: {
        title: bookDto.title,
        author: bookDto.author,
        categoryId: bookDto.categoryId,
      },
    });

    return newBook;
  }

  async checkCategory(categoryId: number) {
    const existingCategoryId = await this.prismaService.category.findUnique({
      where: { id: categoryId },
    });
    return existingCategoryId;
  }
}
