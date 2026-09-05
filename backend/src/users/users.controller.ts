import {
  Controller,
  Get,
  Put,
  Body,
  UseGuards,
  Request,
  ConflictException,
} from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import type { AuthenticatedRequest } from '../auth/authenticated-request';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '../generated/prisma';
import { UpdateMeDto } from './dto/update-me.dto';
import * as bcrypt from 'bcryptjs';

@Controller('users')
@UseGuards(AuthGuard)
export class UsersController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('me')
  async getMe(@Request() req: AuthenticatedRequest) {
    return this.prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        username: true,
        bio: true,
        profileImage: true,
        gameRecord: {
          select: { totalGames: true, successCount: true },
        },
      },
    });
  }

  @Put('me')
  async updateMe(
    @Request() req: AuthenticatedRequest,
    @Body() body: UpdateMeDto,
  ) {
    const userId = req.user.id;
    const { username, bio, profileImage, password } = body;

    // 事前チェックと書き込みの条件を揃える。ズレていると空文字が重複チェックを
    // すり抜けて保存されてしまう
    if (username !== undefined && username !== req.user.username) {
      const existing = await this.prisma.user.findFirst({
        where: { username },
      });
      if (existing) {
        throw new ConflictException('Username is already taken');
      }
    }

    const updateData: Prisma.UserUpdateInput = {};
    if (username !== undefined) updateData.username = username;
    if (bio !== undefined) updateData.bio = bio;
    if (profileImage !== undefined) updateData.profileImage = profileImage;
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    try {
      return await this.prisma.user.update({
        where: { id: userId },
        data: updateData,
        select: {
          id: true,
          email: true,
          username: true,
          bio: true,
          profileImage: true,
        },
      });
    } catch (e) {
      // 上の重複チェックを通っても、同時更新で @unique に衝突しうる
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2002'
      ) {
        throw new ConflictException('Username is already taken');
      }
      throw e;
    }
  }
}
