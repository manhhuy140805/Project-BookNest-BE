import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { Roles, Role, UserData } from 'src/common/decorator';
import { RolesGuard } from 'src/common/guards';
import { UserCreate, UserUpdate } from './Dto';
import type { User } from 'src/generated/prisma/client';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Get()
  getAll() {
    return this.userService.findAll();
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Get('id/:id')
  getById(@Param('id') id: string) {
    return this.userService.findOne(Number(id));
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Delete('remove/:id')
  remove(@Param('id') id: string) {
    return this.userService.remove(Number(id));
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Put('update/:id')
  update(@Param('id') id: string, @Body() userUpdate: UserUpdate) {
    return this.userService.update(Number(id), userUpdate);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Post('create')
  create(@Body() userCreate: UserCreate) {
    return this.userService.create(userCreate);
  }

  @Post('favorite/add/:bookId')
  addFavoriteBook(@Param('bookId') bookId: string, @UserData() user: User) {
    return this.userService.addFavoriteBook(user, Number(bookId));
  }

  @Post('favorite/remove/:bookId')
  removeFavoriteBook(@Param('bookId') bookId: string, @UserData() user: User) {
    return this.userService.removeFavoriteBook(user, Number(bookId));
  }

  @Get('favoriteBoks')
  checkFavorite(@Param('bookId') bookId: string, @UserData() user: User) {
    return this.userService.getListFavoriteBooks(user);
  }
}
