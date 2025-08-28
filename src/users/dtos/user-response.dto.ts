import { ApiProperty } from '@nestjs/swagger';

export default class UserResponseDto {
  @ApiProperty({ example: '123' })
  id: string;

  @ApiProperty({ example: 'John' })
  first_name: string;

  @ApiProperty({ example: 'Doe' })
  last_name: string;

  @ApiProperty({ example: 'john.doe@example.com' })
  email: string;

  @ApiProperty({ example: 25 })
  age: number;
}
