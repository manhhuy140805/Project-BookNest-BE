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
import { CategoryService } from './category.service';
import {
  ClearCache,
  IsCache,
  IsPublic,
  Role,
  Roles,
} from 'src/common/decorator';
import { RolesGuard } from 'src/common/guards';

@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get()
  @IsCache('categories:all', 3600) // Cache 1 hour
  @IsPublic()
  async getAll() {
    return this.categoryService.getAll();
  }

  @Get(':id')
  @IsCache('categories:detail', 3600) // Cache 1 hour
  @IsPublic()
  async getById(@Param('id') id: string) {
    return this.categoryService.getById(Number(id));
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.MODERATOR)
  async create(@Body('name') name: string) {
    return this.categoryService.create(name);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.MODERATOR)
  async delete(@Param('id') id: string) {
    return this.categoryService.delete(Number(id));
  }

  @Put(':id')
  @ClearCache('categories:detail')
  @ClearCache('categories:all')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.MODERATOR)
  async update(@Param('id') id: string, @Body('name') name: string) {
    return this.categoryService.update(Number(id), name);
  }
}
