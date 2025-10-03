import { NextRequest, NextResponse } from 'next/server';
import { preparePage } from '@/lib/browser-utils';

export async function POST(request: NextRequest) {
  let page = null;

  try {
    const { html, title = 'resume' } = await request.json();

    if (!html) {
      console.error('No HTML content provided');
      return NextResponse.json({ error: 'HTML content is required' }, { status: 400 });
    }

    page = await preparePage(html);

    // Generate PDF
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      preferCSSPageSize: true,
      margin: {
        top: '0mm',
        bottom: '0mm',
        left: '0mm',
        right: '0mm',
      },
      timeout: 60000,
    });

    return new NextResponse(Buffer.from(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${title}.pdf"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
      },
    });
  } catch (error) {
    console.error('PDF generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  } finally {
    if (page) {
      try {
        await page.close();
      } catch (e) {
        console.warn('Failed to close page:', e);
      }
    }
  }
}
