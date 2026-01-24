import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRatingDto, UpdateRatingDto } from './dto';

@Injectable()
export class RatingService {
  constructor(private readonly prismaService: PrismaService) {}

  async getAll() {
    return this.prismaService.rating.findMany({
      include: { book: true, user: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getById(id: number) {
    return this.prismaService.rating.findUnique({
      where: { id },
      include: { book: true, user: true },
    });
  }

  async getByBookId(bookId: number) {
    return this.prismaService.rating.findMany({
      where: { bookId },
      include: { user: true, book: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getByUserId(userId: number) {
    return this.prismaService.rating.findMany({
      where: { userId },
      include: { user: true, book: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(userId: number, createRatingDto: CreateRatingDto) {
    const checkExistingBook = await this.prismaService.book.findUnique({
      where: { id: createRatingDto.bookId },
    });

    if (!checkExistingBook) {
      throw new Error('Book does not exist');
    }

    const checkExisting = await this.prismaService.rating.findFirst({
      where: { bookId: createRatingDto.bookId, userId },
    });

    if (checkExisting) {
      throw new Error('User has already rated this book');
    }

    if (createRatingDto.score < 1 || createRatingDto.score > 5) {
      throw new Error('Score must be between 1 and 5');
    }

    return this.prismaService.rating.create({
      data: {
        bookId: createRatingDto.bookId,
        userId,
        score: createRatingDto.score,
        comment: createRatingDto.comment || null,
      },
      include: { user: true, book: true },
    });
  }

  async delete(id: number) {
    return this.prismaService.rating.delete({
      where: { id },
      include: { book: true, user: true },
    });
  }

  async update(id: number, updateRatingDto: UpdateRatingDto) {
    if (
      updateRatingDto.score &&
      (updateRatingDto.score < 1 || updateRatingDto.score > 5)
    ) {
      throw new Error('Score must be between 1 and 5');
    }

    const updateData: any = {};

    if (updateRatingDto.score !== undefined) {
      updateData.score = updateRatingDto.score;
    }

    if (updateRatingDto.comment !== undefined) {
      updateData.comment = updateRatingDto.comment;
    }

    if (Object.keys(updateData).length === 0) {
      throw new Error('At least one field (score or comment) must be provided');
    }

    return this.prismaService.rating.update({
      where: { id },
      data: updateData,
      include: { user: true, book: true },
    });
  }
}
