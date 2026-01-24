import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserCreate, UserUpdate } from './Dto';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from 'src/generated/prisma/enums';
import * as bcrypt from 'bcrypt';
import { User } from 'src/generated/prisma/client';

@Injectable()
export class UserService {
  constructor(private readonly prismaService: PrismaService) {}

  async findAll() {
    const users = await this.prismaService.user.findMany();
    return users;
  }

  async findOne(id: number) {
    const user = await this.prismaService.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        fullName: true,
        avatarUrl: true,
        avatarCloudinaryId: true,
        bio: true,
        dateOfBirth: true,
        role: true,
        isVerified: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async remove(id: number) {
    const user = await this.prismaService.user.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.prismaService.user.delete({ where: { id } });
    return `This action removes user ${user.fullName} with ID #${user.id}`;
  }

  async update(id: number, userUpdate: UserUpdate) {
    const user = await this.prismaService.user.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updateData: any = {};

    if (userUpdate.fullName !== undefined) {
      updateData.fullName = userUpdate.fullName;
    }

    if (userUpdate.avatarUrl !== undefined) {
      updateData.avatarUrl = userUpdate.avatarUrl;
    }

    if (userUpdate.avatarCloudinaryId !== undefined) {
      updateData.avatarCloudinaryId = userUpdate.avatarCloudinaryId;
    }

    if (userUpdate.bio !== undefined) {
      updateData.bio = userUpdate.bio;
    }

    if (userUpdate.dateOfBirth !== undefined) {
      updateData.dateOfBirth = new Date(userUpdate.dateOfBirth);
    }

    if (userUpdate.role !== undefined) {
      updateData.role = userUpdate.role;
    }

    const updatedUser = await this.prismaService.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        fullName: true,
        avatarUrl: true,
        avatarCloudinaryId: true,
        bio: true,
        dateOfBirth: true,
        role: true,
        isVerified: true,
        isActive: true,
        updatedAt: true,
      },
    });
    return updatedUser;
  }

  async create(userCreate: UserCreate) {
    const hashPassword = await bcrypt.hash(userCreate.password, 10);
    const user = await this.prismaService.user.create({
      data: {
        email: userCreate.email,
        hashPassword: hashPassword,
        fullName: userCreate.fullName,
        avatarUrl:
          'https://thumbs.dreamstime.com/b/d-icon-avatar-cute-smiling-woman-cartoon-hipster-character-people-close-up-portrait-isolated-transparent-png-background-352288997.jpg',
        isVerified: false,
        isActive: true,
        role: 'USER',
      },
      select: {
        id: true,
        email: true,
        fullName: true,
      },
    });
    return user;
  }

  async addFavoriteBook(user: User, bookId: number) {
    const book = await this.prismaService.book.findUnique({
      where: { id: bookId },
    });
    if (!book) {
      throw new NotFoundException('Book not found');
    }

    if (await this.checkFavorite(user, bookId)) {
      throw new BadRequestException('Book is already in favorites');
    }

    await this.prismaService.user.update({
      where: { id: user.id },
      data: {
        favoriteBooks: {
          connect: { id: bookId },
        },
      },
    });

    const listFavoriteBooks = await this.prismaService.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        fullName: true,
        favoriteBooks: {
          where: { id: bookId },
          select: {
            id: true,
            title: true,
            author: true,
          },
        },
      },
    });

    return listFavoriteBooks;
  }

  async removeFavoriteBook(user: User, bookId: number) {
    const book = await this.prismaService.book.findUnique({
      where: { id: bookId },
    });

    if (!book) {
      throw new NotFoundException('Book not found');
    }

    if (!(await this.checkFavorite(user, bookId))) {
      throw new BadRequestException('Book is not in favorites');
    }

    await this.prismaService.user.update({
      where: { id: user.id },
      data: {
        favoriteBooks: {
          disconnect: { id: bookId },
        },
      },
    });

    const listFavoriteBooks = await this.prismaService.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        fullName: true,
        favoriteBooks: {
          where: { id: bookId },
          select: {
            id: true,
            title: true,
            author: true,
          },
        },
      },
    });
    return listFavoriteBooks;
  }

  async checkFavorite(user: User, bookId: number) {
    const isFavorite = await this.prismaService.user.findFirst({
      where: {
        id: user.id,
        favoriteBooks: {
          some: { id: bookId }, // Kiểm tra quan hệ giữa user và book
        },
      },
    });
    return Boolean(isFavorite);
  }

  async getListFavoriteBooks(user: User) {
    return await this.prismaService.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        fullName: true,
        favoriteBooks: {
          select: {
            id: true,
            title: true,
            author: true,
          },
        },
      },
    });
  }

  async searchUser(
    keyword: string,
    role: string,
    page: number = 1,
    limit: number = 10,
  ) {
    const roleValues = Object.values(Role);

    const skip = (page - 1) * limit;

    const whereCondition = {
      OR: [
        {
          email: { contains: keyword, mode: 'insensitive' as const },
        },
        {
          fullName: { contains: keyword, mode: 'insensitive' as const },
        },
      ],
      ...(role && roleValues.includes(role as Role) && { role: role as Role }),
    };

    const [users, total] = await Promise.all([
      this.prismaService.user.findMany({
        where: whereCondition,
        skip,
        take: limit,
      }),
      this.prismaService.user.count({
        where: whereCondition,
      }),
    ]);

    return {
      data: users,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
