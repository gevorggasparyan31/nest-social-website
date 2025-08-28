import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { RegisterDto, LoginDto } from './dtos';
import { UserRepository } from '../repositories';
import { validations } from '../constants';
import replacePlaceholders from '../helpers/replacePlaceholders';
import { ConfigService } from '@nestjs/config';
import { AuthTokensService } from './auth_tokens/auth_tokens.service';
import { compare, hash } from 'bcrypt';
const { invalidItem } = validations;
import { userExistsByEmail, InvalidDataForLogin } from './constants';
@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly configService: ConfigService,
    private readonly tokensService: AuthTokensService,
  ) {}

  async register(data: RegisterDto) {
    const salt = this.configService.get<number>('salt');
    const {
      email,
      password,
      age,
      firstName: first_name,
      lastName: last_name,
    } = data;

    const userWithThisEmail = await this.userRepository.findByEmail(email);

    if (userWithThisEmail) {
      throw new ConflictException(
        replacePlaceholders(userExistsByEmail, { email }),
      );
    }

    const hashedPassword = await hash(password, salt as number);

    const user = await this.userRepository.create({
      email,
      age,
      password: hashedPassword,
      first_name,
      last_name,
    });

    const { refreshToken, accessToken } = this.tokensService.generateTokens(
      user.id,
    );

    await this.tokensService.saveRefreshToken(user.id, refreshToken);

    return {
      accessToken,
      refreshToken,
      user,
    };
  }

  async login(data: LoginDto) {
    const { email, password } = data;

    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      throw new BadRequestException(InvalidDataForLogin);
    }

    const { id, password: user_password } = user;

    const match = await compare(password, user_password);

    if (!match) throw new BadRequestException(InvalidDataForLogin);

    const { refreshToken, accessToken } = this.tokensService.generateTokens(id);

    await this.tokensService.saveRefreshToken(user.id, refreshToken);
    return {
      accessToken,
      refreshToken,
    };
  }

  async refresh(refreshToken: string) {
    const payload = await this.tokensService.validateRefreshToken(refreshToken);

    if (!payload) {
      throw new UnauthorizedException(
        replacePlaceholders(invalidItem, {
          item: 'refresh token',
        }),
      );
    }

    const tokens = this.tokensService.generateTokens(payload.userId);
    await this.tokensService.saveRefreshToken(
      payload.userId,
      tokens.refreshToken,
    );
    return tokens;
  }
}
