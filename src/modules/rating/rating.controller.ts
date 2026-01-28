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
import { IsCache, ClearCache, UserData } from 'src/common/decorator';
import { CreateRatingDto, UpdateRatingDto } from './dto';

@Controller('rating')
export class RatingController {
  constructor(private readonly ratingService: RatingService) {}

  @IsCache('ratings:all', 300) // Cache 5 phút
  @Get()
  async getAll() {
    return this.ratingService.getAll();
  }

  @IsCache('ratings:detail', 300) // Cache 5 phút
  @Get(':id')
  async getById(@Param('id') id: string) {
    return this.ratingService.getById(Number(id));
  }

  @IsCache('ratings:by-book', 180) // Cache 3 phút
  @Get('book/:bookId')
  async getByBookId(@Param('bookId') bookId: string) {
    return this.ratingService.getByBookId(Number(bookId));
  }

  @IsCache('ratings:by-user', 180) // Cache 3 phút
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
  @ClearCache(
    'ratings:all',
    'ratings:detail',
    'ratings:by-book',
    'ratings:by-user',
  )
  async update(
    @Param('id') id: string,
    @Body() updateRatingDto: UpdateRatingDto,
  ) {
    return this.ratingService.update(Number(id), updateRatingDto);
  }
}
