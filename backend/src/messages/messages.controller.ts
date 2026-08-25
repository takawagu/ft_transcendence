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
