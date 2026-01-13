import { Injectable } from '@nestjs/common';
import { UserCreate, UserUpdate } from './Dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UserService {
//   constructor(private readonly prismaService: PrismaService) {}

//   findAll() {
//     const users = this.prismaService.user.findMany();
//     return users;
//   }

//   findOne(id: number) {
//     return `This action returns a #${id} user`;
//   }

//   remove(id: number) {
//     return `This action removes a #${id} user`;
//   }

//   update(id: number, userUpdate: UserUpdate) {
//     return `This action updates a #${id} user`;
//   }

//   create(userCreate: UserCreate) {
//     return 'This action adds a new user';
//   }
}
