import { IUser } from '../../interfaces';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthPayload {
  userId: string;
}

export interface RegisterResponse extends AuthTokens {
  user: Omit<IUser, 'password'>;
}
