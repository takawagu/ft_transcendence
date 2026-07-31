import { Controller, Get, Put, Body, UseGuards, Request, ConflictException } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';

@Controller('users')
@UseGuards(AuthGuard)
export class UsersController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('me')
  async getMe(@Request() req: any) {
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
  async updateMe(@Request() req: any, @Body() body: any) {
    const userId = req.user.id;
    const { username, bio, profileImage, password } = body;

    if (username && username !== req.user.username) {
      const existing = await this.prisma.user.findFirst({
        where: { username },
      });
      if (existing) {
        throw new ConflictException('Username is already taken');
      }
    }

    const updateData: any = {};
    if (username !== undefined) updateData.username = username;
    if (bio !== undefined) updateData.bio = bio;
    if (profileImage !== undefined) updateData.profileImage = profileImage;
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await this.prisma.user.update({
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

    return updatedUser;
  }
}
