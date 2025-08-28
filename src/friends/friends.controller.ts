import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import replacePlaceholders from '../helpers/replacePlaceholders';
import { services_controllers } from '../constants';
import {
  RequestDto,
  UpdateFriendRequestDto,
  SendFriendRequestResponseDto,
  BadRequestResponseDto,
  ConflictResponseDto,
  GetFriendRequestsResponseDto,
  UpdateFriendRequestResponseDto,
  UpdateFriendRequestBodyDto,
} from './dtos';
import { FriendsService } from './friends.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth-guard';
import { IResponseType, IFriendRequest, IUser } from '../interfaces';
import { User } from '../users/decorators/request-user.decorator';
import { requestActionSuccessfully } from './constants';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { commonResponses } from '../config/swagger.config';

const { operationSuccessfully } = services_controllers;

@ApiTags('Friends')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('friends')
export class FriendsController {
  constructor(private readonly friendsService: FriendsService) {}

  @Post('/requests')
  @ApiOperation({
    summary: 'Create a friend request',
  })
  @ApiResponse({
    status: 201,
    description: 'Request created',
    type: SendFriendRequestResponseDto,
  })
  @ApiResponse({ status: 400, type: BadRequestResponseDto })
  @ApiResponse({ status: 409, type: ConflictResponseDto })
  @ApiResponse(commonResponses.unauthorized)
  async sendFriendRequest(
    @Body() data: RequestDto,
    @User() user: IUser,
  ): Promise<IResponseType<null>> {
    await this.friendsService.sendFriendRequest(data.receiverId, user.id);
    return {
      success: true,
      message: replacePlaceholders(operationSuccessfully, {
        operation: 'Friend request sent',
      }),
    };
  }

  @Get('/requests')
  @ApiOperation({ summary: 'List friend requests' })
  @ApiResponse({
    status: 200,
    description: 'Requests fetched',
    type: GetFriendRequestsResponseDto,
  })
  @ApiResponse(commonResponses.unauthorized)
  async getRequestsList(
    @User() user: IUser,
  ): Promise<IResponseType<IFriendRequest[]>> {
    const requests = await this.friendsService.getRequestsList(user.id);
    return { success: true, data: requests };
  }

  @Patch('/requests/:id')
  @ApiOperation({ summary: 'Update a friend request' })
  @ApiParam({ name: 'id', example: '123e4567-e89b-12d3-a456-426614174000' })
  @ApiBody({ type: UpdateFriendRequestBodyDto })
  @ApiResponse({
    status: 200,
    description: 'Request updated',
    type: UpdateFriendRequestResponseDto,
  })
  @ApiResponse(commonResponses.badRequest)
  @ApiResponse(commonResponses.unauthorized)
  async updateRequests(
    @Param('id') id: string,
    @User() user: IUser,
    @Body() body: UpdateFriendRequestDto,
  ): Promise<IResponseType<null>> {
    await this.friendsService.updateRequestByAction(id, user.id, body.action);
    return {
      success: true,
      message: replacePlaceholders(requestActionSuccessfully, {
        action: body.action,
      }),
    };
  }
}
