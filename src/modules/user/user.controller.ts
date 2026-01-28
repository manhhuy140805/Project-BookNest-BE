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
import { UserService } from './user.service';
import {
  Roles,
  Role,
  UserData,
  IsCache,
  ClearCache,
} from 'src/common/decorator';
import { RolesGuard } from 'src/common/guards';
import { UserCreate, UserUpdate } from './Dto';
import type { User } from 'src/generated/prisma/client';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @IsCache('users:all', 3600) // Cache 1 hour
  @Get()
  getAll() {
    return this.userService.findAll();
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @IsCache('users:detail', 3600) // Cache 1 hour
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
  @ClearCache('users:detail')
  @ClearCache('users:all')
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

  @Delete('favorite/remove/:bookId')
  removeFavoriteBook(@Param('bookId') bookId: string, @UserData() user: User) {
    return this.userService.removeFavoriteBook(user, Number(bookId));
  }

  @IsCache('users:favorites', 120) // Cache 2 phút
  @Get('favoriteBoks')
  checkFavorite(@Param('bookId') bookId: string, @UserData() user: User) {
    return this.userService.getListFavoriteBooks(user);
  }

  @Get('search')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  searchUser(
    @Query('keyword') keyword: string,
    @Query('role') role: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    return this.userService.searchUser(
      keyword,
      role,
      Number(page),
      Number(limit),
    );
  }
}
