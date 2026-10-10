import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/jwt-auth.guard';
import { MembersService } from './members.service';
@Controller('workspaces/:workspaceId/members')
@UseGuards(JwtAuthGuard)
export class MembersController { constructor(private readonly service: MembersService) {} @Get() list(@Req() req: any, @Param('workspaceId') workspaceId: string) { return this.service.list(req.user.sub, workspaceId); } }
