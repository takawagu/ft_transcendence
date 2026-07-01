import { Module } from '@nestjs/common';
import { ItoGateway } from './ito.gateway';
import { RoomStore } from './service/room.store';
import { BroadcastService } from './service/broadcast.service';
import { RoomService } from './service/room.service';
import { GameService } from './service/game.service';

@Module({
  providers: [
    ItoGateway,
    RoomStore,
    BroadcastService,
    RoomService,
    GameService,
  ],
})
export class ItoModule {}
