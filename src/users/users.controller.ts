import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { IResponseType, IUser } from '../interfaces';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth-guard';
import { User } from './decorators/request-user.decorator';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { commonResponses } from '../config/swagger.config';
import { SearchDto, UserApiResponseDto } from './dtos';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('/')
  @ApiOperation({ summary: 'Search users by query parameters' })
  @ApiResponse(UserApiResponseDto.getUsers)
  @ApiResponse(commonResponses.unauthorized)
  async searchUsers(
    @User() currentUser: IUser,
    @Query() query: SearchDto,
  ): Promise<IResponseType<IUser[]>> {
    const results = await this.usersService.search({
      ...query,
      id: currentUser.id,
    });

    return {
      success: true,
      data: results,
    };
  }
}
