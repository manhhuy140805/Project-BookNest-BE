import { Body, Controller, Delete, Get, Post, Put } from '@nestjs/common';
import { RatingService } from './rating.service';
import { UserData } from 'src/common/decorator';

@Controller('rating')
export class RatingController {
  constructor(private readonly ratingService: RatingService) {}

  @Get()
  async getAll() {
    return this.ratingService.getAll();
  }

  @Get(':id')
  async getById(id: number) {
    return this.ratingService.getById(id);
  }

  @Get('book/:bookId')
  async getByBookId(bookId: string) {
    return this.ratingService.getByBookId(Number(bookId));
  }

  @Get('user/:userId')
  async getByUserId(userId: string) {
    return this.ratingService.getByUserId(Number(userId));
  }

  @Post()
  async create(
    @UserData('id') userId: string,
    @Body('bookId') bookId: string,
    @Body('score') score: number,
  ) {
    return this.ratingService.create(Number(bookId), Number(userId), score);
  }

  @Delete(':id')
  async delete(id: string) {
    return this.ratingService.delete(Number(id));
  }

  @Put(':id')
  async update(@Body('score') score: number, id: string) {
    return this.ratingService.update(Number(id), score);
  }
}
