import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { RatingService } from './rating.service';
import { Cache, UserData } from 'src/common/decorator';
import { CreateRatingDto, UpdateRatingDto } from './dto';

@Controller('rating')
export class RatingController {
  constructor(private readonly ratingService: RatingService) {}

  @Cache('ratings:all', 300) // Cache 5 phút
  @Get()
  async getAll() {
    return this.ratingService.getAll();
  }

  @Cache('ratings:detail', 300) // Cache 5 phút
  @Get(':id')
  async getById(@Param('id') id: string) {
    return this.ratingService.getById(Number(id));
  }

  @Cache('ratings:by-book', 180) // Cache 3 phút
  @Get('book/:bookId')
  async getByBookId(@Param('bookId') bookId: string) {
    return this.ratingService.getByBookId(Number(bookId));
  }

  @Cache('ratings:by-user', 180) // Cache 3 phút
  @Get('user/:userId')
  async getByUserId(@Param('userId') userId: string) {
    return this.ratingService.getByUserId(Number(userId));
  }

  @Post()
  async create(
    @UserData('id') userId: string,
    @Body() createRatingDto: CreateRatingDto,
  ) {
    return this.ratingService.create(Number(userId), createRatingDto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.ratingService.delete(Number(id));
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateRatingDto: UpdateRatingDto,
  ) {
    return this.ratingService.update(Number(id), updateRatingDto);
  }
}
