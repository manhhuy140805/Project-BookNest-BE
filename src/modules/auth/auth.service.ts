import { ForbiddenException, Injectable } from '@nestjs/common';
import type { AuthDto } from './dto';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(authDto: AuthDto) {
    const hashPassword = await bcrypt.hash(authDto.password, 10);
    try {
      const user = await this.prisma.user.create({
        data: {
          email: authDto.email,
          hashPassword: hashPassword,
        },
        select: { id: true, email: true, createdAt: true },
      });
      return user;
    } catch (error) {
      if (error instanceof Error && 'code' in error && error.code === 'P2002') {
        throw new ForbiddenException('Email already exists');
      }
      throw error;
    }
  }

  async login(authDto: AuthDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: authDto.email },
    });
    if (!user) {
      throw new ForbiddenException('Tài khoản hoặc mật khẩu không đúng');
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
