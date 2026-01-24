import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CategoryService {
  constructor(private readonly prismaService: PrismaService) {}

  async getAll() {
    return this.prismaService.category.findMany();
  }

  async getById(id: number) {
    return this.prismaService.category.findUnique({ where: { id } });
  }

  async create(name: string) {
    const existingCategory = await this.prismaService.category.findUnique({
      where: { name },
    });

    if (existingCategory) {
      throw new BadRequestException('Category already exists');
    }

    return this.prismaService.category.create({
      data: { name },
    });
  }

  async delete(id: number) {
    const uncategorized = await this.prismaService.category.upsert({
      where: { name: 'Uncategorized' },
      update: {},
      create: { name: 'Uncategorized' },
    });

    await this.prismaService.book.updateMany({
      where: { categoryId: id },
      data: { categoryId: uncategorized.id },
    });

    if (id != uncategorized.id) {
      return this.prismaService.category.delete({ where: { id } });
    }

    throw new BadRequestException('Cannot delete Uncategorized category');
  }

  async update(id: number, name: string) {
    const uncategorized = await this.prismaService.category.findUnique({
      where: { name: 'Uncategorized' },
    });

    if (id === uncategorized?.id) {
      throw new BadRequestException('Cannot rename Uncategorized category');
    }

    const existingCategory = await this.prismaService.category.findUnique({
      where: { name },
    });

    if (existingCategory) {
      throw new BadRequestException('Category name already exists');
    }

    return this.prismaService.category.update({
      where: { id },
      data: { name },
    });
  }
}
