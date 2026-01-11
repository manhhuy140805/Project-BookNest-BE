import { Controller, Get, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { MyJwtGuard } from '../auth/guards';
import { getUser } from 'src/common/decorator';
import type { User } from 'src/generated/prisma/client';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('profile')
  @UseGuards(MyJwtGuard)
  getProfile(@getUser() user: User) {
    return user;
  }
}
