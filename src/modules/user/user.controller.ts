import { Controller, Get, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { MyJwtGuard } from '../auth/guards';
import { UserData } from 'src/common/decorator';
import type { User } from 'src/generated/prisma/client';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('profile')
  @UseGuards(MyJwtGuard)
  getProfile(@UserData() user: User) {
    return user;
  }
}
