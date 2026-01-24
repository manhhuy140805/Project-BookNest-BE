import { ForbiddenException, Injectable } from '@nestjs/common';
import type { AuthLoginDto, AuthRegisterDto } from './dto';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import type { User } from 'src/generated/prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(authDto: AuthRegisterDto) {
    const hashPassword = await bcrypt.hash(authDto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        email: authDto.email,
        hashPassword: hashPassword,
        fullName: authDto.fullName,
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
        role: true,
        isVerified: true,
        isActive: true,
      },
    });
    return user;
  }

  async login(authDto: AuthLoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: authDto.email },
    });
    if (!user) {
      throw new ForbiddenException('Tài khoản hoặc mật khẩu không đúng');
    }
    if (!user.isActive) {
      throw new ForbiddenException('Tài khoản đã bị vô hiệu hóa');
    }
    const passwordMatches = await bcrypt.compare(
      authDto.password,
      user.hashPassword,
    );
    if (!passwordMatches) {
      throw new ForbiddenException('Tài khoản hoặc mật khẩu không đúng');
    }
    return this.signToken(user.id, user.email);
  }

  getMe(user: User) {
    return user;
  }

  async signToken(
    userId: number,
    email: string,
  ): Promise<{ access_token: string }> {
    const payload = {
      sub: userId,
      email,
    };
    const token = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: '1h',
    });
    return {
      access_token: token,
    };
  }
}
