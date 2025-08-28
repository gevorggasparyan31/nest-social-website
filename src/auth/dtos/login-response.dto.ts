import { ApiProperty } from '@nestjs/swagger';

export default class LoginResponseDto {
  @ApiProperty()
  accessToken: string;

  @ApiProperty()
  refreshToken: string;
}
