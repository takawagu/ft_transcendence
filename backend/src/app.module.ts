import { Module } from '@nestjs/common';
import { GameModule } from './game/game.module';
import { ItoModule } from './ito/ito.module';

@Module({
  imports: [GameModule, ItoModule],
})
export class AppModule { }
