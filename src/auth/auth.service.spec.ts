import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserRepository } from '../repositories';
import { ConfigService } from '@nestjs/config';
import {
  BadRequestException,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { IUser } from '../interfaces';
import { AuthTokensService } from './auth_tokens/auth_tokens.service';
import { RegisterDto, LoginDto } from './dtos';

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: UserRepository;
  let tokensService: AuthTokensService;

  const mockUser: IUser = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    first_name: 'John',
    last_name: 'Doe',
    age: 25,
    email: 'john@example.com',
    password: '$2b$10$testHash', // This is a hashed password
  };

  const mockUserRepository = {
    findByEmail: jest.fn(),
    create: jest.fn(),
  };

  const mockTokensService = {
    generateTokens: jest.fn(),
    saveRefreshToken: jest.fn(),
    validateRefreshToken: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn().mockReturnValue(10), // salt value
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserRepository,
          useValue: mockUserRepository,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: AuthTokensService,
          useValue: mockTokensService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepository = module.get<UserRepository>(UserRepository);
    tokensService = module.get<AuthTokensService>(AuthTokensService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    const loginDto: LoginDto = {
      email: 'john@example.com',
      password: 'password123',
    };

    it('should return access and refresh tokens when credentials are valid', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      jest.spyOn(require('bcrypt'), 'compare').mockResolvedValue(true);
      mockTokensService.generateTokens.mockReturnValue({
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
      });

      const result = await service.login(loginDto);

      expect(result).toEqual({
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
      });
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(
        loginDto.email,
      );
      expect(mockTokensService.saveRefreshToken).toHaveBeenCalledWith(
        mockUser.id,
        'mock-refresh-token',
      );
    });

    it('should throw BadRequestException when user not found', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException when password is invalid', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      jest.spyOn(require('bcrypt'), 'compare').mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('register', () => {
    const registerDto: RegisterDto = {
      firstName: 'John',
      lastName: 'Doe',
      age: 25,
      email: 'john@example.com',
      password: 'Password123!',
      confirmPassword: 'Password123!',
    };

    it('should create a new user and return tokens', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockUserRepository.create.mockResolvedValue(mockUser);
      mockTokensService.generateTokens.mockReturnValue({
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
      });

      const result = await service.register(registerDto);

      expect(result).toEqual({
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
        user: mockUser,
      });
      expect(mockUserRepository.create).toHaveBeenCalled();
      expect(mockUserRepository.create.mock.calls[0][0].password).not.toBe(
        registerDto.password,
      ); // Password should be hashed
      expect(mockTokensService.saveRefreshToken).toHaveBeenCalledWith(
        mockUser.id,
        'mock-refresh-token',
      );
    });

    it('should throw ConflictException when email already exists', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);

      await expect(service.register(registerDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('refresh', () => {
    it('should return new tokens when refresh token is valid', async () => {
      const mockPayload = { userId: mockUser.id };
      mockTokensService.validateRefreshToken.mockResolvedValue(mockPayload);
      mockTokensService.generateTokens.mockReturnValue({
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      });

      const result = await service.refresh('valid-refresh-token');

      expect(result).toEqual({
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      });
      expect(mockTokensService.saveRefreshToken).toHaveBeenCalledWith(
        mockUser.id,
        'new-refresh-token',
      );
    });

    it('should throw UnauthorizedException when refresh token is invalid', async () => {
      mockTokensService.validateRefreshToken.mockResolvedValue(null);

      await expect(service.refresh('invalid-refresh-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
