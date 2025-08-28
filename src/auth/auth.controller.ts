import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { services_controllers } from '../constants';
import replacePlaceholders from '../helpers/replacePlaceholders';
import { IResponseType } from '../interfaces';
import {
  RegisterDto,
  LoginDto,
  RefreshDto,
  RegisterResponseDto,
  LoginResponseDto,
} from './dtos';
import { AuthTokens, RegisterResponse } from './interfaces';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { commonResponses } from '../config/swagger.config';

const { operationSuccessfully } = services_controllers;

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({
    description: 'User successfully registered',
    type: RegisterResponseDto,
  })
  @ApiResponse(commonResponses.badRequest)
  @ApiResponse(commonResponses.unauthorized)
  async register(
    @Body() data: RegisterDto,
  ): Promise<IResponseType<RegisterResponse>> {
    const returnData = await this.authService.register(data);

    return {
      success: true,
      data: returnData,
      message: replacePlaceholders(operationSuccessfully, {
        operation: 'User registration',
      }),
    };
  }

  @Post('login')
  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({
    description: 'User successfully logged in',
    type: LoginResponseDto,
  })
  @ApiResponse(commonResponses.badRequest)
  @ApiResponse(commonResponses.unauthorized)
  async login(@Body() data: LoginDto): Promise<IResponseType<AuthTokens>> {
    const returnData = await this.authService.login(data);

    return {
      success: true,
      data: returnData,
    };
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({
    description: 'Token successfully refreshed',
    type: LoginResponseDto,
  })
  @ApiResponse(commonResponses.badRequest)
  @ApiResponse(commonResponses.unauthorized)
  async refresh(@Body() data: RefreshDto): Promise<IResponseType<AuthTokens>> {
    const returnData = await this.authService.refresh(data.refresh_token);

    return {
      success: true,
      data: returnData,
    };
  }
}
