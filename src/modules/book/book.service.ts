import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateBookDto, UpdateBookDto } from './Dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BookService {
  constructor(private readonly prismaService: PrismaService) {}

  async createBook(createBookDto: CreateBookDto) {
    if (await this.checkCategory(createBookDto.categoryId)) {
      throw new NotFoundException('Category does not exist');
    }

    const newBook = await this.prismaService.book.create({
      data: {
        title: createBookDto.title,
        author: createBookDto.author,
        description: createBookDto.description || null,
        categoryId: createBookDto.categoryId,
        coverUrl: createBookDto.coverUrl || null,
        coverCloudinaryId: createBookDto.coverCloudinaryId || null,
        pdfUrl: createBookDto.pdfUrl || null,
        pdfFileId: createBookDto.pdfFileId || null,
        pdfFileName: createBookDto.pdfFileName || null,
        pdfSize: createBookDto.pdfSize || null,
      },
      include: { category: true },
    });

    return newBook;
  }

  async getAllBooks() {
    const books = await this.prismaService.book.findMany({
      select: {
        id: true,
        title: true,
        author: true,
        description: true,
        coverUrl: true,
        categoryId: true,
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    return books;
  }

  async getBookById(id: number) {
    const book = await this.prismaService.book.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        author: true,
        description: true,
        coverUrl: true,
        pdfUrl: true,
        pdfFileName: true,
        pdfSize: true,
        categoryId: true,
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        createdAt: true,
        updatedAt: true,
      },
    });
    if (!book) {
      throw new NotFoundException('Book not found');
    }
    return book;
  }

  async updateBook(id: number, updateBookDto: UpdateBookDto) {
    const book = await this.prismaService.book.findUnique({ where: { id } });
    if (!book) {
      throw new NotFoundException('Book not found');
    }
    if (
      updateBookDto.categoryId &&
      (await this.checkCategory(updateBookDto.categoryId))
    ) {
      throw new NotFoundException('Category does not exist');
    }

    const updateData: any = {};

    if (updateBookDto.title !== undefined) {
      updateData.title = updateBookDto.title;
    }

    if (updateBookDto.author !== undefined) {
      updateData.author = updateBookDto.author;
    }

    if (updateBookDto.description !== undefined) {
      updateData.description = updateBookDto.description;
    }

    if (updateBookDto.categoryId !== undefined) {
      updateData.categoryId = updateBookDto.categoryId;
    }

    if (updateBookDto.coverUrl !== undefined) {
      updateData.coverUrl = updateBookDto.coverUrl;
    }

    if (updateBookDto.coverCloudinaryId !== undefined) {
      updateData.coverCloudinaryId = updateBookDto.coverCloudinaryId;
    }

    if (updateBookDto.pdfUrl !== undefined) {
      updateData.pdfUrl = updateBookDto.pdfUrl;
    }

    if (updateBookDto.pdfFileId !== undefined) {
      updateData.pdfFileId = updateBookDto.pdfFileId;
    }

    if (updateBookDto.pdfFileName !== undefined) {
      updateData.pdfFileName = updateBookDto.pdfFileName;
    }

    if (updateBookDto.pdfSize !== undefined) {
      updateData.pdfSize = updateBookDto.pdfSize;
    }

    const updatedBook = await this.prismaService.book.update({
      where: { id },
      data: updateData,
      include: { category: true },
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

  async searchBooks(
    keyword: string,
    categoryId: number,
    page: number = 1,
    limit: number = 10,
  ) {
    const skip = (page - 1) * limit;

    // Build điều kiện search đơn giản
    const whereClause: any = {};

    if (keyword && keyword.trim()) {
      whereClause.OR = [
        { title: { contains: keyword.trim(), mode: 'insensitive' as const } },
        { author: { contains: keyword.trim(), mode: 'insensitive' as const } },
        {
          description: {
            contains: keyword.trim(),
            mode: 'insensitive' as const,
          },
        },
      ];
    }

    if (categoryId) {
      whereClause.categoryId = categoryId;
    }

    // Parallel queries để tăng tốc
    const [books, total] = await Promise.all([
      this.prismaService.book.findMany({
        where: whereClause,
        select: {
          id: true,
          title: true,
          author: true,
          description: true,
          coverUrl: true,
          categoryId: true,
          category: {
            select: {
              id: true,
              name: true,
            },
          },
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prismaService.book.count({
        where: whereClause,
      }),
    ]);

    return {
      data: books,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async checkCategory(categoryId: number) {
    const existingCategoryId = await this.prismaService.category.findUnique({
      where: { id: categoryId },
    });
    return !existingCategoryId;
  }
}
