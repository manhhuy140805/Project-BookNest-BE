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

    return `Book ${book.title} with ID #${id} has been deleted`;
  }

  async searchBooks(keyword: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [books, total] = await Promise.all([
      this.prismaService.book.findMany({
        where: {
          OR: [
            {
              title: {
                contains: keyword,
                mode: 'insensitive',
              },
            },
            {
              author: {
                contains: keyword,
                mode: 'insensitive',
              },
            },
          ],
        },
        skip,
        take: limit,
        include: {
          category: true,
          ratings: {
            select: {
              score: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prismaService.book.count({
        where: {
          OR: [
            {
              title: {
                contains: keyword,
                mode: 'insensitive',
              },
            },
            {
              author: {
                contains: keyword,
                mode: 'insensitive',
              },
            },
          ],
        },
      }),
    ]);

    const booksWithAvgRating = books.map((book) => {
      const avgRating =
        book.ratings.length > 0
          ? book.ratings.reduce((sum, r) => sum + r.score, 0) /
            book.ratings.length
          : 0;

      return {
        ...book,
        averageRating: Number(avgRating.toFixed(1)),
        totalRatings: book.ratings.length,
      };
    });

    return {
      data: booksWithAvgRating,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async checkCategory(categoryId: number) {
    const existingCategoryId = await this.prismaService.category.findUnique({
      where: { id: categoryId },
    });
    return !existingCategoryId;
  }
}
