import { Module } from '@nestjs/common';
import { WorkspaceAccessService } from '../common/workspace-access.service';
import { MembersController } from './members.controller';
import { MembersService } from './members.service';
@Module({ controllers: [MembersController], providers: [MembersService, WorkspaceAccessService] })
export class MembersModule {}
