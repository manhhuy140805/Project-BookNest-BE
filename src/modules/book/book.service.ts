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

  async getAllBooks() {
    const books = await this.prismaService.book.findMany();
    return books;
  }

  async getBookById(id: number) {
    const book = await this.prismaService.book.findUnique({ where: { id } });
    if (!book) {
      throw new NotFoundException('Book not found');
    }
    return book;
  }

  async updateBook(id: number, bookDto: BookDto) {
    const book = await this.prismaService.book.findUnique({ where: { id } });
    if (!book) {
      throw new NotFoundException('Book not found');
    }
    if (await this.checkCategory(bookDto.categoryId)) {
      throw new NotFoundException('Category does not exist');
    }
    const updatedBook = await this.prismaService.book.update({
      where: { id },
      data: {
        title: bookDto.title,
        author: bookDto.author,
        categoryId: bookDto.categoryId,
      },
    });
    return updatedBook;
  }

  async deleteBook(id: number) {
    const book = await this.prismaService.book.findUnique({ where: { id } });
    if (!book) {
      throw new NotFoundException('Book not found');
    }
    await this.prismaService.book.delete({ where: { id } });

    return `Book with ${book.title} - #${id} has been deleted`;
  }

  async checkCategory(categoryId: number) {
    const existingCategoryId = await this.prismaService.category.findUnique({
      where: { id: categoryId },
    });
    return !existingCategoryId;
  }
}
