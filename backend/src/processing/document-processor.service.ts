import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { PdfExtractorService } from './pdf-extractor.service';
import { OpenAiService } from '../ai/openai.service';

@Injectable()
export class DocumentProcessorService {
  private readonly logger = new Logger(DocumentProcessorService.name);
  private readonly chunkSize = 1200;
  private readonly overlap = 180;

  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
    private readonly extractor: PdfExtractorService,
    private readonly ai: OpenAiService,
  ) {}

  async process(documentId: string): Promise<void> {
    const document = await this.prisma.document.findUnique({ where: { id: documentId } });
    if (!document) return;

    await this.prisma.document.update({ where: { id: documentId }, data: { status: 'PROCESSING', failureReason: null } });

    try {
      const result = await this.extractor.extract(this.storage.rootPath, document.storageKey);
      const chunks = result.pages.flatMap((page) => this.chunkPage(page.pageNumber, page.text));

      if (chunks.length === 0) throw new Error('No readable text was found in the PDF');

      await this.prisma.$transaction([
        this.prisma.documentChunk.deleteMany({ where: { documentId } }),
        this.prisma.documentChunk.createMany({
          data: chunks.map((chunk, index) => ({
            documentId,
            workspaceId: document.workspaceId,
            chunkIndex: index,
            pageNumber: chunk.pageNumber,
            content: chunk.content,
          })),
        }),
      ]);
      const storedChunks = await this.prisma.documentChunk.findMany({ where: { documentId }, orderBy: { chunkIndex: 'asc' }, select: { id: true, content: true } });
      const embeddings = await this.ai.createEmbeddings(storedChunks.map((chunk) => chunk.content));
      for (let index = 0; index < storedChunks.length; index++) {
        await this.prisma.$executeRawUnsafe(`UPDATE "DocumentChunk" SET "embedding" = $1::vector WHERE "id" = $2::uuid`, `[${embeddings[index].join(',')}]`, storedChunks[index].id);
      }
      await this.prisma.document.update({ where: { id: documentId }, data: { pageCount: result.pageCount, status: 'READY', failureReason: null } });
      this.logger.log(`Document ${documentId} processed into ${chunks.length} chunks`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown processing error';
      await this.prisma.document.update({ where: { id: documentId }, data: { status: 'FAILED', failureReason: message } });
      this.logger.error(`Document ${documentId} failed: ${message}`);
    }
  }

  private chunkPage(pageNumber: number, text: string): Array<{ pageNumber: number; content: string }> {
    const chunks: Array<{ pageNumber: number; content: string }> = [];
    for (let start = 0; start < text.length; start += this.chunkSize - this.overlap) {
      const content = text.slice(start, start + this.chunkSize).trim();
      if (content) chunks.push({ pageNumber, content });
      if (start + this.chunkSize >= text.length) break;
    }
    return chunks;
  }
}
