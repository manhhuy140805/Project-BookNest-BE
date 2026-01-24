/* eslint-disable @typescript-eslint/no-unused-vars */
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
      orderBy: { id: 'desc' },
      include: { category: true },
    });
    return books;
  }

  async getBookById(id: number) {
    const book = await this.prismaService.book.findUnique({ where: { id } });
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

    // Tách keyword thành các từ để tìm kiếm linh hoạt hơn
    const keywords = keyword
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0);

    // Build điều kiện search cho từng từ khóa
    const searchConditions = keywords.flatMap((word) => [
      { title: { contains: word, mode: 'insensitive' as const } },
      { author: { contains: word, mode: 'insensitive' as const } },
      { description: { contains: word, mode: 'insensitive' as const } },
    ]);

    const whereClause = {
      ...(searchConditions.length > 0 ? { OR: searchConditions } : {}),
      ...(categoryId ? { categoryId } : {}),
    };

    const [books, total] = await Promise.all([
      this.prismaService.book.findMany({
        where: whereClause,
        include: { category: true, ratings: true },
        skip,
        take: limit * 3, // Lấy nhiều hơn để sort theo relevance
      }),
      this.prismaService.book.count({
        where: whereClause,
      }),
    ]);

    // Tính relevance score: title match = 3 điểm, author = 2, description = 1
    const booksWithScore = books.map((book) => {
      let relevanceScore = 0;
      const titleLower = book.title.toLowerCase();
      const authorLower = book.author.toLowerCase();
      const descLower = (book.description || '').toLowerCase();

      keywords.forEach((word) => {
        const wordLower = word.toLowerCase();
        // Exact match > partial match
        if (titleLower === wordLower) relevanceScore += 10;
        else if (titleLower.includes(wordLower)) relevanceScore += 3;

        if (authorLower === wordLower) relevanceScore += 8;
        else if (authorLower.includes(wordLower)) relevanceScore += 2;

        if (descLower.includes(wordLower)) relevanceScore += 1;
      });

      // Tính avgRating
      const totalRatings = book.ratings.length;
      const avgRating =
        totalRatings > 0
          ? book.ratings.reduce((sum, rating) => sum + rating.score, 0) /
            totalRatings
          : 0;

      return {
        ...book,
        avgRating: parseFloat(avgRating.toFixed(2)),
        relevanceScore,
      };
    });

    // Sort theo relevance score (cao -> thấp), sau đó paginate
    const sortedBooks = booksWithScore
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, limit)
      .map((book) => {
        const { relevanceScore, ...rest } = book;
        return rest;
      });

    return {
      data: sortedBooks,
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
