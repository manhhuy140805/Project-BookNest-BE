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
import { Roles, Role } from 'src/common/decorator';
import { RolesGuard } from 'src/common/guards';
import { UserCreate, UserUpdate } from './Dto';

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
}
