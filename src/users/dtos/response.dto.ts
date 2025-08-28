import { ApiResponseOptions } from '@nestjs/swagger';
import UserResponseDto from './user-response.dto';

export default class UserApiResponses {
  static readonly getUsers: ApiResponseOptions = {
    status: 200,
    description: 'Users retrieved successfully',
    type: UserResponseDto,
    isArray: true,
  };
}
