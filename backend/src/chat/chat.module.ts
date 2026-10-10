import { Module } from '@nestjs/common';
import { AiModule } from '../ai/ai.module';
import { WorkspaceAccessService } from '../common/workspace-access.service';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
@Module({ imports: [AiModule], controllers: [ChatController], providers: [ChatService, WorkspaceAccessService] })
export class ChatModule {}
