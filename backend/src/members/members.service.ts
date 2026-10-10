import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WorkspaceAccessService } from '../common/workspace-access.service';
@Injectable()
export class MembersService {
  constructor(private readonly prisma: PrismaService, private readonly access: WorkspaceAccessService) {}
  async list(userId: string, workspaceId: string) { await this.access.requireMember(workspaceId, userId); const members = await this.prisma.workspaceMember.findMany({ where: { workspaceId, status: { not: 'REMOVED' } }, include: { user: { select: { id: true, name: true, email: true } } }, orderBy: { createdAt: 'asc' } }); return members.map((member) => ({ id: member.user.id, name: member.user.name, email: member.user.email, role: member.role, status: member.status, joinedAt: member.createdAt })); }
}
