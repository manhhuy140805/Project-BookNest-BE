import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { BookService } from './book.service';
import { CreateBookDto, UpdateBookDto } from './Dto';
import {
  IsPublic,
  Role,
  Roles,
  IsCache,
  ClearCache,
  UserData,
} from 'src/common/decorator';
import { RolesGuard } from 'src/common/guards';
import { SearchService } from '../search/search.service';
import type { User } from 'src/generated/prisma/client';

@Controller('book')
export class BookController {
  constructor(
    private readonly bookService: BookService,
    private readonly searchService: SearchService,
  ) {}

  @Post('create')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async createBook(@Body() createBookDto: CreateBookDto) {
    return this.bookService.createBook(createBookDto);
  }

  @IsPublic()
  @IsCache('books:all', 600)
  @Get()
  async getAllBooks() {
    return this.bookService.getAllBooks();
  }

  @IsPublic()
  @IsCache('books:detail', 600)
  @Get('id/:id')
  async getBookById(@Param('id') id: string) {
    return this.bookService.getBookById(Number(id));
  }

  @Put('update/:id')
  @ClearCache('books:detail', 'books:all')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async updateBook(
    @Param('id') id: string,
    @Body() updateBookDto: UpdateBookDto,
  ) {
    return this.bookService.updateBook(Number(id), updateBookDto);
  }

  @Delete('delete/:id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async deleteBook(@Param('id') id: string) {
    return this.bookService.deleteBook(Number(id));
  }

  @IsPublic()
  @Get('search')
  async searchBooks(
    @Query('keyword') keyword: string,
    @Query('categoryId') categoryId: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @UserData() user?: User,
  ) {
    const result = await this.bookService.searchBooks(
      keyword,
      Number(categoryId),
      Number(page),
      Number(limit),
    );

    if (user && keyword) {
      await this.searchService.saveSearch(user.id, keyword, result.total || 0);
    }

    return result;
  }
}
