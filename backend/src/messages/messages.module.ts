import { Module } from '@nestjs/common';
import { MessagesController } from './messages.controller';
import { MessagesService } from './messages.service';
import { FriendsModule } from '../friends/friends.module';
import { PresenceModule } from '../presence/presence.module';

@Module({
  imports: [FriendsModule, PresenceModule],
  controllers: [MessagesController],
  providers: [MessagesService],
})
export class MessagesModule {}
