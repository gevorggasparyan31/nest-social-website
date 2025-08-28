import { IsUUID, IsNotEmpty } from 'class-validator';
import { validations } from '../../constants';
import replacePlaceholders from '../../helpers/replacePlaceholders';
import { ApiProperty } from '@nestjs/swagger';

const { notEmpty, invalidItem } = validations;

export default class RequestDto {
  @ApiProperty({
    description: 'Unique identifier of the user you want to connect with',
    example: '550e8400-e29b-41d4-a716-446655440000',
    format: 'uuid',
  })
  @IsNotEmpty({
    message: replacePlaceholders(notEmpty, { item: 'Receiver ID' }),
  })
  @IsUUID('4', {
    message: replacePlaceholders(invalidItem, { item: 'Receiver ID' }),
  })
  receiverId: string;
}
