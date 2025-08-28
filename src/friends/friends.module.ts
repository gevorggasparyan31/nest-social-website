import { Module } from '@nestjs/common';
import { FriendsService } from './friends.service';
import { FriendsController } from './friends.controller';
import { DatabaseModule } from '../database/database.module';
import { UsersModule } from '../users/users.module';
import { FriendRequestsRepository, FriendsRepository } from '../repositories';

@Module({
  imports: [DatabaseModule, UsersModule],
  providers: [FriendsService, FriendRequestsRepository, FriendsRepository],
  controllers: [FriendsController],
})
export class FriendsModule {}
