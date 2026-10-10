import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WorkspaceAccessService } from '../common/workspace-access.service';
import { OpenAiService } from '../ai/openai.service';

@Injectable()
export class ChatService {
  constructor(private readonly prisma: PrismaService, private readonly access: WorkspaceAccessService, private readonly ai: OpenAiService) {}

  async ask(userId: string, workspaceId: string, question: string, conversationId?: string) {
    await this.access.requireMember(workspaceId, userId);
    const queryVector = (await this.ai.createEmbeddings([question]))[0];
    const vector = `[${queryVector.join(',')}]`;
    const chunks = await this.prisma.$queryRawUnsafe<Array<{ id: string; documentId: string; documentName: string; pageNumber: number; content: string; score: number }>>(
      `SELECT c."id", c."documentId", d."name" AS "documentName", c."pageNumber", c."content", 1 - (c."embedding" <=> $1::vector) AS "score" FROM "DocumentChunk" c JOIN "Document" d ON d."id" = c."documentId" WHERE c."workspaceId" = $2::uuid AND c."embedding" IS NOT NULL ORDER BY c."embedding" <=> $1::vector LIMIT 6`, vector, workspaceId);
    const selected = chunks.filter((chunk) => chunk.score >= 0.15);
    const answer = selected.length
      ? await this.ai.answer(question, selected)
      : 'I could not find any relevant information because this workspace does not have a processed PDF document yet. Upload a PDF and wait until its status becomes READY, then ask your question again.';
    const conversation = conversationId ? await this.prisma.conversation.findFirstOrThrow({ where: { id: conversationId, workspaceId, userId } }) : await this.prisma.conversation.create({ data: { workspaceId, userId, title: question.slice(0, 80) } });
    await this.prisma.message.create({ data: { conversationId: conversation.id, role: 'USER', content: question } });
    const message = await this.prisma.message.create({ data: { conversationId: conversation.id, role: 'ASSISTANT', content: answer, citations: { create: selected.map((chunk) => ({ documentId: chunk.documentId, chunkId: chunk.id, pageNumber: chunk.pageNumber, relevanceScore: chunk.score })) } }, include: { citations: { include: { document: { select: { name: true } } } } } });
    return { conversationId: conversation.id, messageId: message.id, answer, citations: message.citations.map((citation) => ({ documentId: citation.documentId, documentName: citation.document.name, pageNumber: citation.pageNumber, relevanceScore: citation.relevanceScore })) };
  }
}
