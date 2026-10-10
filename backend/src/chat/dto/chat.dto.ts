import { IsOptional, IsString, IsUUID, MinLength } from 'class-validator';
export class AskQuestionDto { @IsString() @MinLength(2) question!: string; @IsOptional() @IsUUID() conversationId?: string; }
