import { Controller, Get, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { Roles, UserData, Role } from 'src/common/decorator';
import { type User } from 'src/generated/prisma/client';
import { RolesGuard } from 'src/common/guards';

@Controller('user')
export class UserController {
  // constructor(private readonly userService: UserService) {}
  // @UseGuards(RolesGuard)
  // @Roles(Role.ADMIN)
  // @Get()
  // getAll(@UserData() user: User) {
  //   return user;
  // }
}
