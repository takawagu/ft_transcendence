import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import type { AuthenticatedRequest } from '../auth/authenticated-request';
import { FriendsService } from './friends.service';
import {
  SendFriendRequestDto,
  SearchUsersDto,
  FriendshipIdDto,
  FriendIdDto,
  UserIdDto,
} from './dto/friends.dto';

@Controller('friends')
@UseGuards(AuthGuard)
export class FriendsController {
  constructor(private readonly friendsService: FriendsService) {}

  @Get()
  getFriends(@Request() req: AuthenticatedRequest) {
    return this.friendsService.getFriends(req.user.id);
  }

  @Get('requests')
  getRequests(@Request() req: AuthenticatedRequest) {
    return this.friendsService.getRequests(req.user.id);
  }

  @Get('blocks')
  getBlocks(@Request() req: AuthenticatedRequest) {
    return this.friendsService.getBlocks(req.user.id);
  }

  @Get('search')
  searchUsers(
    @Request() req: AuthenticatedRequest,
    @Query() query: SearchUsersDto,
  ) {
    return this.friendsService.searchUsers(req.user.id, query.q);
  }

  @Post('request')
  sendRequest(
    @Request() req: AuthenticatedRequest,
    @Body() body: SendFriendRequestDto,
  ) {
    return this.friendsService.sendRequest(req.user.id, body.query);
  }

  @Post('accept')
  acceptRequest(
    @Request() req: AuthenticatedRequest,
    @Body() body: FriendshipIdDto,
  ) {
    return this.friendsService.acceptRequest(req.user.id, body.friendshipId);
  }

  @Post('reject')
  rejectRequest(
    @Request() req: AuthenticatedRequest,
    @Body() body: FriendshipIdDto,
  ) {
    return this.friendsService.rejectRequest(req.user.id, body.friendshipId);
  }

  @Post('remove')
  removeFriend(
    @Request() req: AuthenticatedRequest,
    @Body() body: FriendIdDto,
  ) {
    return this.friendsService.removeFriend(req.user.id, body.friendId);
  }

  @Post('block')
  blockUser(@Request() req: AuthenticatedRequest, @Body() body: UserIdDto) {
    return this.friendsService.blockUser(req.user.id, body.userId);
  }

  @Post('unblock')
  unblockUser(@Request() req: AuthenticatedRequest, @Body() body: UserIdDto) {
    return this.friendsService.unblockUser(req.user.id, body.userId);
  }
}
