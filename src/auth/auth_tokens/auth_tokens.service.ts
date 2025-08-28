import { Injectable } from '@nestjs/common';
import { AuthPayload } from '../interfaces';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { RefreshTokensRepository } from '../../repositories';

@Injectable()
export class AuthTokensService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly refreshTokensRepository: RefreshTokensRepository,
  ) {}

  generateAccessToken(payload: AuthPayload): string {
    return this.jwtService.sign(payload, {
      secret: this.configService.get<string>('accessTokenSecret'),
      expiresIn: this.configService.get<string>('accessTokenExpiresIn'),
    });
  }

  generateRefreshToken(payload: AuthPayload): string {
    return this.jwtService.sign(payload, {
      secret: this.configService.get<string>('refreshTokenSecret'),
      expiresIn: this.configService.get<string>('refreshTokenExpiresIn'),
    });
  }

  generateTokens(userId: string): {
    accessToken: string;
    refreshToken: string;
  } {
    const accessToken = this.generateAccessToken({
      userId,
    });
    const refreshToken = this.generateRefreshToken({
      userId,
    });

    return { accessToken, refreshToken };
  }

  async saveRefreshToken(userId: string, token: string) {
    await this.deleteRefreshToken(userId);
    const expiresIn = this.configService.get<string>(
      'refreshTokenExpiresIn',
    ) as string;
    const expiresAt = new Date();
    expiresAt.setSeconds(
      expiresAt.getSeconds() + this.parseExpiresIn(expiresIn),
    );

    await this.refreshTokensRepository.create({
      user_id: userId,
      token,
      expires_at: expiresAt,
    });
  }

  async validateRefreshToken(
    refreshToken: string,
  ): Promise<AuthPayload | null> {
    try {
      const tokens = await this.refreshTokensRepository.findByQuery({
        token: refreshToken,
      });

      if (!tokens || !tokens.length) {
        return null;
      }

      const refreshTokenSecret =
        this.configService.get<string>('refreshTokenSecret');

      const token = tokens[0];

      if (new Date(token.expires_at) < new Date()) {
        return null;
      }

      const payload = this.jwtService.verify<AuthPayload>(refreshToken, {
        secret: refreshTokenSecret,
      });

      if (payload.userId !== token.user_id) {
        return null;
      }

      return payload;
    } catch {
      return null;
    }
  }

  async deleteRefreshToken(userId: string) {
    const refreshToken = await this.refreshTokensRepository.findByQuery({
      user_id: userId,
    });

    if (!refreshToken.length) {
      return;
    }
    await this.refreshTokensRepository.delete(refreshToken[0]?.id);
  }

  private parseExpiresIn(expiresIn: string): number {
    const time = parseInt(expiresIn, 10);
    if (expiresIn.endsWith('d')) return time * 24 * 60 * 60;
    if (expiresIn.endsWith('h')) return time * 60 * 60;
    if (expiresIn.endsWith('m')) return time * 60;
    return time;
  }
}
