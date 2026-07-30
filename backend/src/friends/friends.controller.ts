import { Controller, Get, Post, Body, UseGuards, Request, NotFoundException, BadRequestException } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { PrismaService } from '../prisma/prisma.service';

@Controller('friends')
@UseGuards(AuthGuard)
export class FriendsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async getFriends(@Request() req: any) {
    const myId = req.user.id;

    const friendships = await this.prisma.friendship.findMany({
      where: {
        OR: [
          { applicantId: myId },
          { approverId: myId }
        ],
        status: 'ACCEPTED',
      },
      include: {
        applicant: {
          select: { id: true, email: true, username: true, bio: true, profileImage: true }
        },
        approver: {
          select: { id: true, email: true, username: true, bio: true, profileImage: true }
        }
      }
    });

    return friendships.map(f => {
      return f.applicantId === myId ? f.approver : f.applicant;
    });
  }

  @Get('requests')
  async getRequests(@Request() req: any) {
    const myId = req.user.id;

    const incoming = await this.prisma.friendship.findMany({
      where: {
        approverId: myId,
        status: 'PENDING'
      },
      include: {
        applicant: {
          select: { id: true, email: true, username: true, bio: true, profileImage: true }
        }
      }
    });

    const outgoing = await this.prisma.friendship.findMany({
      where: {
        applicantId: myId,
        status: 'PENDING'
      },
      include: {
        approver: {
          select: { id: true, email: true, username: true, bio: true, profileImage: true }
        }
      }
    });

    return {
      incoming: incoming.map(f => ({ id: f.id, user: f.applicant })),
      outgoing: outgoing.map(f => ({ id: f.id, user: f.approver }))
    };
  }

  @Post('request')
  async sendRequest(@Request() req: any, @Body() body: { query: string }) {
    const myId = req.user.id;
    const { query } = body;

    if (!query) {
      throw new BadRequestException('Username or email is required');
    }

    const targetUser = await this.prisma.user.findFirst({
      where: {
        OR: [
          { username: query },
          { email: query }
        ]
      }
    });

    if (!targetUser) {
      throw new NotFoundException('User not found');
    }

    if (targetUser.id === myId) {
      throw new BadRequestException('You cannot add yourself as a friend');
    }

    const existing = await this.prisma.friendship.findFirst({
      where: {
        OR: [
          { applicantId: myId, approverId: targetUser.id },
          { applicantId: targetUser.id, approverId: myId }
        ]
      }
    });

    if (existing) {
      if (existing.status === 'ACCEPTED') {
        throw new BadRequestException('Already friends');
      }
      if (existing.status === 'PENDING') {
        throw new BadRequestException('Friend request is already pending');
      }
      await this.prisma.friendship.update({
        where: { id: existing.id },
        data: {
          applicantId: myId,
          approverId: targetUser.id,
          status: 'PENDING'
        }
      });
      return { success: true };
    }

    await this.prisma.friendship.create({
      data: {
        applicantId: myId,
        approverId: targetUser.id,
        status: 'PENDING'
      }
    });

    return { success: true };
  }

  @Post('accept')
  async acceptRequest(@Request() req: any, @Body() body: { friendshipId: number }) {
    const myId = req.user.id;
    const { friendshipId } = body;

    const friendship = await this.prisma.friendship.findUnique({
      where: { id: friendshipId }
    });

    if (!friendship || friendship.approverId !== myId) {
      throw new BadRequestException('Friend request not found or not for you');
    }

    await this.prisma.friendship.update({
      where: { id: friendshipId },
      data: { status: 'ACCEPTED' }
    });

    return { success: true };
  }

  @Post('reject')
  async rejectRequest(@Request() req: any, @Body() body: { friendshipId: number }) {
    const myId = req.user.id;
    const { friendshipId } = body;

    const friendship = await this.prisma.friendship.findUnique({
      where: { id: friendshipId }
    });

    if (!friendship || (friendship.approverId !== myId && friendship.applicantId !== myId)) {
      throw new BadRequestException('Friend request not found');
    }

    await this.prisma.friendship.delete({
      where: { id: friendshipId }
    });

    return { success: true };
  }

  @Post('remove')
  async removeFriend(@Request() req: any, @Body() body: { friendId: number }) {
    const myId = req.user.id;
    const { friendId } = body;

    const friendship = await this.prisma.friendship.findFirst({
      where: {
        OR: [
          { applicantId: myId, approverId: friendId },
          { applicantId: friendId, approverId: myId }
        ],
        status: 'ACCEPTED'
      }
    });

    if (!friendship) {
      throw new BadRequestException('Friendship not found');
    }

    await this.prisma.friendship.delete({
      where: { id: friendship.id }
    });

    return { success: true };
  }
}
