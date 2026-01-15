import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { BookService } from './book.service';
import { BookDto } from './Dto';
import { Role, Roles } from 'src/common/decorator';
import { RolesGuard } from 'src/common/guards';

@Controller('book')
export class BookController {
  constructor(private readonly bookService: BookService) {}

  @Post('create')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async createBook(@Body() bookDto: BookDto) {
    return this.bookService.createBook(bookDto);
  }

  @Get()
  async getAllBooks() {
    return this.bookService.getAllBooks();
  }

  @Get(':id')
  async getBookById(@Param('id') id: string) {
    return this.bookService.getBookById(Number(id));
  }

  @Post('update/:id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async updateBook(@Param('id') id: string, @Body() bookDto: BookDto) {
    return this.bookService.updateBook(Number(id), bookDto);
  }

  @Delete('delete/:id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async deleteBook(@Param('id') id: string) {
    return this.bookService.deleteBook(Number(id));
  }
}
