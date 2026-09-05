import { Module } from '@nestjs/common';
import { MessagesController } from './messages.controller';
import { MessagesService } from './messages.service';
import { FriendsModule } from '../friends/friends.module';
import { PresenceModule } from '../presence/presence.module';
import { ItoModule } from '../ito/ito.module';

@Module({
  // ItoModule は MessagesModule を参照しないので循環参照にはならない
  imports: [FriendsModule, PresenceModule, ItoModule],
  controllers: [MessagesController],
  providers: [MessagesService],
})
export class MessagesModule {}
