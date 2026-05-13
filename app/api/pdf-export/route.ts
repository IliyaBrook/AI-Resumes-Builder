import { NextRequest, NextResponse } from 'next/server';
import { preparePage } from '@/lib/browser-utils';

export async function POST(request: NextRequest) {
  let page = null;

  try {
    const requestData = await request.json();
    let html = requestData.html;
    const title = requestData.title || 'resume';

    if (!html) {
      console.error('No HTML content provided');
      return NextResponse.json({ error: 'HTML content is required' }, { status: 400 });
    }

    // Add meta tag to disable automatic detection of email/phone numbers
    if (!html.includes('format-detection')) {
      html = html.replace('<head>', '<head><meta name="format-detection" content="telephone=no, email=no">');
    }

    page = await preparePage(html);

    // Remove auto-detected mailto: and tel: links that Chrome creates
    await page.evaluate(() => {
      const autoLinks = document.querySelectorAll('a[href^="mailto:"], a[href^="tel:"]');
      autoLinks.forEach(link => {
        const span = document.createElement('span');
        span.textContent = link.textContent || '';
        span.className = link.className;
        span.style.cssText = window.getComputedStyle(link).cssText;
        link.parentNode?.replaceChild(span, link);
      });
    });

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
