import { ApiProperty } from '@nestjs/swagger';

export class BasicSuccessResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Operation completed successfully' })
  message: string;
}

export class SendFriendRequestResponseDto extends BasicSuccessResponseDto {
  @ApiProperty({ example: 'Request sending has been made successfully' })
  declare message: string;
}

export class BadRequestResponseDto {
  @ApiProperty({ example: false })
  success: boolean;

  @ApiProperty({ example: 400 })
  statusCode: number;

  @ApiProperty({ example: 'The Receiver ID is invalid' })
  message: string;
}

export class ConflictResponseDto {
  @ApiProperty({ example: false })
  success: boolean;

  @ApiProperty({ example: 409 })
  statusCode: number;

  @ApiProperty({ example: 'Friend request is already exists' })
  message: string;
}

export class FriendRequestItemDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174001' })
  sender_id: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174002' })
  receiver_id: string;

  @ApiProperty({
    enum: ['pending', 'declined', 'accepted'],
    example: 'pending',
  })
  status: string;

  @ApiProperty({
    format: 'date-time',
    example: '2024-01-15T10:30:00Z',
  })
  created_at: string;

  @ApiProperty({ example: 'John' })
  first_name: string;

  @ApiProperty({ example: 'Doe' })
  last_name: string;

  @ApiProperty({ example: 'john.doe@example.com' })
  email: string;
}

export class GetFriendRequestsResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({
    type: () => [FriendRequestItemDto],
    description: 'Array of friend requests',
  })
  data: FriendRequestItemDto[];
}

export class UpdateFriendRequestResponseDto extends BasicSuccessResponseDto {
  @ApiProperty({ example: 'The request has been accepted successfully' })
  declare message: string;

  @ApiProperty({ type: Object, example: null })
  data: null;
}

export class UpdateFriendRequestBodyDto {
  @ApiProperty({
    enum: ['accept', 'decline'],
    example: 'accept',
    description: 'Action to perform on the friend request (accept or decline)',
  })
  action: string;
}
