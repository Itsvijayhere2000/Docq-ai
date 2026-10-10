import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { readFile } from 'fs/promises';
import { join } from 'path';

export interface ExtractedPage {
  pageNumber: number;
  text: string;
}

@Injectable()
export class PdfExtractorService {
  async extract(storageRoot: string, storageKey: string): Promise<{ pages: ExtractedPage[]; pageCount: number }> {
    const buffer = await readFile(join(storageRoot, storageKey));
    const parser = this.createParser(buffer);
    const parsed = await parser.getText();
    await parser.destroy();
    const pages = (parsed.pages || [])
      .map((page: { num: number; text: string }) => ({ pageNumber: page.num, text: String(page.text || '').replace(/\s+/g, ' ').trim() }))
      .filter((page) => page.text.length > 0);

    return { pages, pageCount: Number(parsed.total) || pages.length };
  }

  private createParser(buffer: Buffer): { getText: () => Promise<{ pages?: Array<{ num: number; text: string }>; total?: number }>; destroy: () => Promise<void> } {
    try {
      // pdf-parse v2 exposes the PDFParse class (v1 exposed a function).
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const loaded = require('pdf-parse');
      const PDFParse = loaded.PDFParse || loaded.default?.PDFParse;
      if (!PDFParse) throw new Error('PDFParse export not found');
      return new PDFParse({ data: buffer });
    } catch {
      throw new ServiceUnavailableException(
        'PDF processing is not configured. Install the backend dependency with: npm install pdf-parse',
      );
    }
  }
}
