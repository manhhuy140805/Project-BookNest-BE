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
} from 'src/common/decorator';
import { RolesGuard } from 'src/common/guards';

@Controller('book')
export class BookController {
  constructor(private readonly bookService: BookService) {}

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
  ) {
    return this.bookService.searchBooks(
      keyword,
      Number(categoryId),
      Number(page),
      Number(limit),
    );
  }
}
