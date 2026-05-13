import mammoth from 'mammoth';

export type SupportedResumeMime =
  | 'application/pdf'
  | 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

const PDF_MIME = 'application/pdf';
const DOCX_MIME = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

export function detectResumeMime(file: { name: string; type: string }): SupportedResumeMime | null {
  const name = file.name.toLowerCase();
  if (file.type === PDF_MIME || name.endsWith('.pdf')) return PDF_MIME;
  if (file.type === DOCX_MIME || name.endsWith('.docx')) return DOCX_MIME;
  return null;
}

export async function extractDocxHtml(buffer: ArrayBuffer): Promise<string> {
  const result = await mammoth.convertToHtml({ buffer: Buffer.from(buffer) });
  return result.value;
}
