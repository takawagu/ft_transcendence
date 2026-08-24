import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { FriendsService } from './friends.service';
import {
  SendFriendRequestDto,
  FriendshipIdDto,
  FriendIdDto,
  UserIdDto,
} from './dto/friends.dto';

@Controller('friends')
@UseGuards(AuthGuard)
export class FriendsController {
  constructor(private readonly friendsService: FriendsService) {}

  @Get()
  getFriends(@Request() req: any) {
    return this.friendsService.getFriends(req.user.id);
  }

  @Get('requests')
  getRequests(@Request() req: any) {
    return this.friendsService.getRequests(req.user.id);
  }

  @Get('blocks')
  getBlocks(@Request() req: any) {
    return this.friendsService.getBlocks(req.user.id);
  }

  @Post('request')
  sendRequest(@Request() req: any, @Body() body: SendFriendRequestDto) {
    return this.friendsService.sendRequest(req.user.id, body.query);
  }

  @Post('accept')
  acceptRequest(@Request() req: any, @Body() body: FriendshipIdDto) {
    return this.friendsService.acceptRequest(req.user.id, body.friendshipId);
  }

  @Post('reject')
  rejectRequest(@Request() req: any, @Body() body: FriendshipIdDto) {
    return this.friendsService.rejectRequest(req.user.id, body.friendshipId);
  }

  @Post('remove')
  removeFriend(@Request() req: any, @Body() body: FriendIdDto) {
    return this.friendsService.removeFriend(req.user.id, body.friendId);
  }

  @Post('block')
  blockUser(@Request() req: any, @Body() body: UserIdDto) {
    return this.friendsService.blockUser(req.user.id, body.userId);
  }

  @Post('unblock')
  unblockUser(@Request() req: any, @Body() body: UserIdDto) {
    return this.friendsService.unblockUser(req.user.id, body.userId);
  }
}
