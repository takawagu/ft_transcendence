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
import { SendMessageDto, HistoryQueryDto } from './dto/messages.dto';

@Controller('messages')
@UseGuards(AuthGuard)
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Get('conversations')
  getConversations(@Request() req: any) {
    return this.messagesService.getConversations(req.user.id);
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
