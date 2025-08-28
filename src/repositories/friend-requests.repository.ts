import { Injectable } from '@nestjs/common';
import { BaseRepository } from './base.repository';
import { DatabaseService } from '../database/database.service';
import { IFriendRequest, IFriendRequestWithSender } from '../interfaces';

@Injectable()
export default class FriendRequestsRepository extends BaseRepository<IFriendRequest> {
  constructor(db: DatabaseService) {
    super(db, 'friend_requests');
  }

  async getRequestsWithSenderDetails(
    receiverId: string,
  ): Promise<IFriendRequestWithSender[]> {
    const query = `
      SELECT 
        fr.id,
        fr.sender_id,
        fr.receiver_id,
        fr.status,
        fr.created_at,
        u.first_name,
        u.last_name,
        u.email
      FROM friend_requests fr
      JOIN users u ON fr.sender_id = u.id
      WHERE fr.receiver_id = $1 AND fr.status = 'pending'
      ORDER BY fr.created_at DESC
    `;

    return await this.db.query<IFriendRequestWithSender>(query, [receiverId]);
  }
}
