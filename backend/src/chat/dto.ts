import { IsNotEmpty, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateDirectConversationDto {
  @IsUUID()
  userId: string;
}

export class CreateGroupConversationDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name: string;

  @IsUUID(undefined, { each: true })
  userIds: string[];
}

export class AddMemberDto {
  @IsUUID()
  userId: string;
}

export class SendMessageDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  content: string;
}
