import { Test, TestingModule } from '@nestjs/testing';
import { AuthTokensService } from './auth_tokens.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { RefreshTokensRepository } from '../../repositories';

describe('AuthTokensService', () => {
  let service: AuthTokensService;

  const mockJwtService = {
    sign: jest.fn(),
    verify: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn().mockReturnValue('7d'),
  };

  const mockRefreshTokensRepository = {
    create: jest.fn(),
    findByQuery: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthTokensService,
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: RefreshTokensRepository,
          useValue: mockRefreshTokensRepository,
        },
      ],
    }).compile();

    service = module.get<AuthTokensService>(AuthTokensService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateTokens', () => {
    it('should generate access and refresh tokens', () => {
      const userId = '123e4567-e89b-12d3-a456-426614174000';
      const mockAccessToken = 'mock-access-token';
      const mockRefreshToken = 'mock-refresh-token';

      mockJwtService.sign
        .mockReturnValueOnce(mockAccessToken)
        .mockReturnValueOnce(mockRefreshToken);

      const result = service.generateTokens(userId);

      expect(result).toEqual({
        accessToken: mockAccessToken,
        refreshToken: mockRefreshToken,
      });
      expect(mockJwtService.sign).toHaveBeenCalledTimes(2);
      expect(mockRefreshTokensRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('deleteRefreshToken', () => {
    it('should delete existing refresh token', async () => {
      const userId = '123e4567-e89b-12d3-a456-426614174000';
      const mockToken = {
        id: 'token-id',
        user_id: userId,
        token: 'old-token',
        expires_at: new Date(),
      };

      mockRefreshTokensRepository.findByQuery.mockResolvedValue([mockToken]);

      await service.deleteRefreshToken(userId);

      expect(mockRefreshTokensRepository.findByQuery).toHaveBeenCalledWith({
        user_id: userId,
      });
      expect(mockRefreshTokensRepository.delete).toHaveBeenCalledWith(
        mockToken.id,
      );
    });

    it('should handle case when no refresh token exists', async () => {
      const userId = '123e4567-e89b-12d3-a456-426614174000';

      mockRefreshTokensRepository.findByQuery.mockResolvedValue([]);

      await service.deleteRefreshToken(userId);

      expect(mockRefreshTokensRepository.findByQuery).toHaveBeenCalledWith({
        user_id: userId,
      });
    });
  });

  describe('saveRefreshToken', () => {
    it('should save refresh token with expiration', async () => {
      const userId = '123e4567-e89b-12d3-a456-426614174000';
      const mockToken = 'mock-refresh-token';

      mockRefreshTokensRepository.findByQuery.mockResolvedValue([]);

      await service.saveRefreshToken(userId, mockToken);

      expect(mockRefreshTokensRepository.create).toHaveBeenCalledWith({
        user_id: userId,
        token: mockToken,
        expires_at: expect.any(Date),
      });
    });
  });

  describe('validateRefreshToken', () => {
    it('should validate refresh token and return payload', async () => {
      const mockToken = 'valid-refresh-token';
      const mockPayload = { userId: '123e4567-e89b-12d3-a456-426614174000' };
      const mockExpiresAt = new Date();
      mockExpiresAt.setHours(mockExpiresAt.getHours() + 1); // Token expires in 1 hour

      mockJwtService.verify.mockReturnValue(mockPayload);
      mockRefreshTokensRepository.findByQuery.mockResolvedValue([
        {
          token: mockToken,
          user_id: mockPayload.userId,
          expires_at: mockExpiresAt,
        },
      ]);

      const result = await service.validateRefreshToken(mockToken);

      expect(result).toEqual(mockPayload);
      expect(mockJwtService.verify).toHaveBeenCalledWith(mockToken, {
        secret: '7d',
      });
    });

    it('should return null for invalid token', async () => {
      const mockToken = 'invalid-refresh-token';
      const mockExpiresAt = new Date();
      mockExpiresAt.setHours(mockExpiresAt.getHours() + 1);

      mockRefreshTokensRepository.findByQuery.mockResolvedValue([
        {
          token: mockToken,
          user_id: '123e4567-e89b-12d3-a456-426614174000',
          expires_at: mockExpiresAt,
        },
      ]);

      mockJwtService.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      const result = await service.validateRefreshToken(mockToken);

      expect(result).toBeNull();
      expect(mockJwtService.verify).toHaveBeenCalledWith(mockToken, {
        secret: '7d',
      });
    });

    it('should return null for expired token', async () => {
      const mockToken = 'expired-refresh-token';
      const mockPayload = { userId: '123e4567-e89b-12d3-a456-426614174000' };
      const mockExpiresAt = new Date();
      mockExpiresAt.setHours(mockExpiresAt.getHours() - 1);

      mockJwtService.verify.mockReturnValue(mockPayload);
      mockRefreshTokensRepository.findByQuery.mockResolvedValue([
        {
          token: mockToken,
          user_id: mockPayload.userId,
          expires_at: mockExpiresAt,
        },
      ]);

      const result = await service.validateRefreshToken(mockToken);

      expect(result).toBeNull();
    });

    it('should return null when token not found', async () => {
      const mockToken = 'non-existent-token';

      mockRefreshTokensRepository.findByQuery.mockResolvedValue([]);

      const result = await service.validateRefreshToken(mockToken);

      expect(result).toBeNull();
    });

    it('should handle case when findByQuery returns undefined', async () => {
      const mockToken = 'non-existent-token';

      mockRefreshTokensRepository.findByQuery.mockResolvedValue(undefined);

      const result = await service.validateRefreshToken(mockToken);

      expect(result).toBeNull();
    });
  });
});
