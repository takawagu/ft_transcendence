import { Module, Global } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { AuthGuard } from './auth.guard';
import { PresenceModule } from '../presence/presence.module';

@Global()
@Module({
  // 多重ログイン判定に PresenceService.isOnline を使う。
  // PresenceModule は imports が空で、PresenceGateway は @Global な AuthModule から
  // AuthService を受け取っているため、モジュールの依存は一方向のまま
  imports: [PresenceModule],
  providers: [AuthService, AuthGuard],
  controllers: [AuthController],
  exports: [AuthService, AuthGuard],
})
export class AuthModule {}
