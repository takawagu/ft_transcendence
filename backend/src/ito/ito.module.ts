import { Module } from '@nestjs/common';
import { ItoGateway } from './ito.gateway';
import { RoomStore } from './service/room.store';
import { BroadcastService } from './service/broadcast.service';
import { RoomService } from './service/room.service';
import { GameService } from './service/game.service';
import { FriendsModule } from '../friends/friends.module';

@Module({
  // ルーム参加時のブロック判定に FriendsService.areBlockedEitherWay を使う。
  // FriendsModule は ItoModule を参照しない（依存は Friends → Presence の一方向）ので循環しない
  imports: [FriendsModule],
  providers: [
    ItoGateway,
    RoomStore,
    BroadcastService,
    RoomService,
    GameService,
  ],
  // ルーム招待の検証（ホスト判定・在室判定）でHTTP側からルームの実体を読むため。
  // RoomStoreはgatewayやソケットに依存しない純粋なストアなので、外から読んでも副作用がない
  // （docs/room-invite-requirements.md セクション2）
  exports: [RoomStore],
})
export class ItoModule {}
