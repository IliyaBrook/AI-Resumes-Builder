import { Hono } from 'hono';
import { detectResumeMime, extractDocxHtml } from '@/lib/file-parsing/extract-text';
import { parseResumeFromFile, parseResumeFromHtml } from '@/lib/ai/server/resume-import';

const MAX_FILE_BYTES = 8 * 1024 * 1024;

const importRoute = new Hono().post('/resume', async c => {
  try {
    const body = await c.req.parseBody();
    const file = body['file'];

    if (!(file instanceof File)) {
      return c.json({ success: false, message: 'File is required' }, 400);
    }

    if (file.size === 0) {
      return c.json({ success: false, message: 'Uploaded file is empty' }, 400);
    }

    if (file.size > MAX_FILE_BYTES) {
      return c.json({ success: false, message: 'File is larger than 8MB' }, 400);
    }

    const mime = detectResumeMime({ name: file.name, type: file.type });
    if (!mime) {
      return c.json({ success: false, message: 'Only PDF and DOCX files are supported' }, 400);
    }

    const buffer = await file.arrayBuffer();

    let result;
    if (mime === 'application/pdf') {
      result = await parseResumeFromFile({
        data: Buffer.from(buffer),
        mimeType: 'application/pdf',
      });
    } else {
      const html = await extractDocxHtml(buffer);
      if (!html || html.trim().length < 30) {
        return c.json({ success: false, message: 'Could not extract readable content from the file' }, 400);
      }
      result = await parseResumeFromHtml(html);
    }

    return c.json({ success: 'ok', data: result }, 200);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to import resume';
    return c.json({ success: false, message }, 500);
  }
});

export default importRoute;
