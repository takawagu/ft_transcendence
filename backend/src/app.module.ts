import { Module } from '@nestjs/common';
import { ItoModule } from './ito/ito.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { FriendsModule } from './friends/friends.module';
import { PresenceModule } from './presence/presence.module';
import { MessagesModule } from './messages/messages.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UsersModule,
    PresenceModule,
    FriendsModule,
    MessagesModule,
    ItoModule,
  ],
})
export class AppModule {}
