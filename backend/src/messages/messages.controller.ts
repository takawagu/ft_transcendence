import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { MessagesService } from './messages.service';
import {
  SendMessageDto,
  HistoryQueryDto,
  MarkReadDto,
  SendRoomInviteDto,
} from './dto/messages.dto';

@Controller('messages')
@UseGuards(AuthGuard)
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Get('conversations')
  getConversations(@Request() req: any) {
    return this.messagesService.getConversations(req.user.id);
  }

  // ':userId' より先に宣言すること。後ろに置くと /messages/unread がそちらに吸われる
  @Get('unread')
  getUnreadCounts(@Request() req: any) {
    return this.messagesService.getUnreadCounts(req.user.id);
  }

  @Post('read')
  markRead(@Request() req: any, @Body() body: MarkReadDto) {
    return this.messagesService.markRead(
      req.user.id,
      body.userId,
      body.lastMessageId,
    );
  }

  // POST なので下の @Get(':userId') とは食い合わない。
  // 将来 GET /invite を足す場合は ':userId' より前に置くこと
  @Post('invite')
  sendRoomInvite(@Request() req: any, @Body() body: SendRoomInviteDto) {
    return this.messagesService.sendRoomInvite(
      req.user.id,
      body.receiverId,
      body.roomCode,
    );
  }

  @Get(':userId')
  getHistory(
    @Request() req: any,
    @Param('userId', ParseIntPipe) userId: number,
    @Query() query: HistoryQueryDto,
  ) {
    return this.messagesService.getHistory(
      req.user.id,
      userId,
      query.before,
      query.limit,
    );
  }

  @Post()
  sendMessage(@Request() req: any, @Body() body: SendMessageDto) {
    return this.messagesService.sendMessage(
      req.user.id,
      body.receiverId,
      body.content,
    );
  }
}
