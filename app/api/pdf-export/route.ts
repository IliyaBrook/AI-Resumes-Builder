import { NextRequest, NextResponse } from 'next/server';
import puppeteer, { Browser } from 'puppeteer';

let browser: Browser | null = null;

async function getBrowser() {
  if (!browser) {
    try {
      browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu',
          '--disable-web-security',
          '--disable-features=VizDisplayCompositor',
        ],
        executablePath: process.env.CHROME_EXECUTABLE_PATH || undefined,
      });
      console.log('Puppeteer browser launched successfully');
    } catch (error) {
      console.error('Failed to launch Puppeteer browser:', error);
      throw new Error(`Browser launch failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  return browser;
}

export async function POST(request: NextRequest) {
  let page = null;

  try {
    console.log('Starting PDF generation request');
    const { html, title = 'resume' } = await request.json();

    if (!html) {
      console.error('No HTML content provided');
      return NextResponse.json({ error: 'HTML content is required' }, { status: 400 });
    }

    const browserInstance = await getBrowser();
    page = await browserInstance.newPage();

    // Set viewport to A4 size
    console.log('Setting viewport');
    await page.setViewport({ width: 794, height: 1123 });

    // Set the HTML content
    await page.setContent(html, {
      waitUntil: ['domcontentloaded', 'networkidle0'],
      timeout: 30000,
    });

    // Wait for fonts and images to load
    await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 2000)));

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

    console.log('PDF generated successfully');

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

// Cleanup on process exit
process.on('exit', () => {
  if (browser) {
    void browser.close();
  }
});
