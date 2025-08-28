import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RefreshTokensRepository, UserRepository } from '../repositories';
import { DatabaseModule } from '../database/database.module';
import { AuthTokensService } from './auth_tokens/auth_tokens.service';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategies/jwt';

@Module({
  imports: [
    DatabaseModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_ACCESS_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_ACCESS_TTL'),
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    UserRepository,
    AuthTokensService,
    JwtService,
    RefreshTokensRepository,
    JwtStrategy,
  ],
  exports: [
    AuthService,
    AuthTokensService,
    JwtService,
    RefreshTokensRepository,
    JwtStrategy,
  ],
})
export class AuthModule {}
