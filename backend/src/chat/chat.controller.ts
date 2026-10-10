import { Body, Controller, Param, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/jwt-auth.guard';
import { ChatService } from './chat.service';
import { AskQuestionDto } from './dto/chat.dto';
@Controller('workspaces/:workspaceId/chat')
@UseGuards(JwtAuthGuard)
export class ChatController { constructor(private readonly service: ChatService) {} @Post() ask(@Req() req: any, @Param('workspaceId') workspaceId: string, @Body() dto: AskQuestionDto) { return this.service.ask(req.user.sub, workspaceId, dto.question, dto.conversationId); } }
