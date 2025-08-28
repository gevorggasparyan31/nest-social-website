import { Injectable } from '@nestjs/common';
import { BaseRepository } from './base.repository';
import { DatabaseService } from '../database/database.service';
import { IRefreshToken } from '../interfaces';

@Injectable()
export default class RefreshTokensRepository extends BaseRepository<IRefreshToken> {
  constructor(db: DatabaseService) {
    super(db, 'refresh_tokens');
  }
}
