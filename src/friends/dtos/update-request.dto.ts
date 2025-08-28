import { FRIEND_REQUESTS_ACTION, invalidActionType } from '../constants';
import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export default class UpdateFriendRequestDto {
  @ApiProperty({
    description: 'Action to update the friend request',
    enum: FRIEND_REQUESTS_ACTION,
    example: FRIEND_REQUESTS_ACTION.ACCEPT,
  })
  @IsEnum(FRIEND_REQUESTS_ACTION, {
    message: invalidActionType,
  })
  action: FRIEND_REQUESTS_ACTION;
}
