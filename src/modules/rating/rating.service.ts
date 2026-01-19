import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RatingService {
  constructor(private readonly prismaService: PrismaService) {}

  async getAll() {
    return this.prismaService.rating.findMany({
      include: { book: true, user: true },
    });
  }

  async getById(id: number) {
    return this.prismaService.rating.findUnique({ where: { id } });
  }

  async getByBookId(bookId: number) {
    return this.prismaService.rating.findMany({
      where: { bookId },
      include: { user: true, book: true },
    });
  }

  async getByUserId(userId: number) {
    return this.prismaService.rating.findMany({
      where: { userId },
      include: { user: true, book: true },
    });
  }

  async create(bookId: number, userId: number, score: number) {
    const checkExistingBook = await this.prismaService.book.findUnique({
      where: { id: bookId },
    });

    if (!checkExistingBook) {
      throw new Error('Book does not exist');
    }

    const checkExisting = await this.prismaService.rating.findFirst({
      where: { bookId, userId },
    });

    if (checkExisting) {
      throw new Error('User has already rated this book');
    }

    if (score < 1 || score > 5) {
      throw new Error('Score must be between 1 and 5');
    }

    return this.prismaService.rating.create({
      data: {
        bookId,
        userId,
        score,
      },
      include: { user: true, book: true },
    });
  }

  async delete(id: number) {
    return this.prismaService.rating.delete({ where: { id } });
  }

  async update(id: number, score: number) {
    if (score < 1 || score > 5) {
      throw new Error('Score must be between 1 and 5');
    }

    return this.prismaService.rating.update({
      where: { id },
      data: { score },
      include: { user: true, book: true },
    });
  }
}
