import { Module } from '@nestjs/common';
import { ItoModule } from './ito/ito.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { FriendsModule } from './friends/friends.module';

@Module({
  imports: [PrismaModule, AuthModule, UsersModule, FriendsModule, ItoModule],
})
export class AppModule {}
