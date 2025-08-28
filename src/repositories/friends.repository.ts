import { Injectable } from '@nestjs/common';
import { BaseRepository } from './base.repository';
import { DatabaseService } from '../database/database.service';
import { IFriends } from '../interfaces';

@Injectable()
export default class FriendsRepository extends BaseRepository<IFriends> {
  constructor(db: DatabaseService) {
    super(db, 'friends');
  }

  async checkFriendshipStatus(
    senderId: string,
    receiverId: string,
  ): Promise<boolean> {
    const sql = `
    SELECT 1 FROM friends 
    WHERE (user_id_1 = $1 AND user_id_2 = $2)
    UNION
    SELECT 1 FROM friends 
    WHERE (user_id_1 = $2 AND user_id_2 = $1)
    LIMIT 1;
  `;

    const result = await this.db.query(sql, [senderId, receiverId]);
    return result.length > 0;
  }
}
