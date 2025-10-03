import { NextRequest, NextResponse } from 'next/server';
import puppeteer, { Browser } from 'puppeteer';
import { existsSync, readdirSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

let browser: Browser | null = null;

function findChrome() {
  // Common Chrome paths for different platforms and installations
  const chromePaths = [
    // Environment variable
    process.env.CHROME_EXECUTABLE_PATH,

    // Puppeteer cache locations
    join(homedir(), '.cache/puppeteer/chrome/linux-*/chrome-linux64/chrome'),
    join(homedir(), '.local/share/puppeteer/chrome/linux-*/chrome-linux64/chrome'),

    // System Chrome installations
    '/usr/bin/google-chrome-stable',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium-browser',
    '/usr/bin/chromium',
    '/opt/google/chrome/google-chrome',

    // Snap installations
    '/snap/bin/chromium',
    '/var/lib/snapd/desktop/applications/chromium_chromium.desktop',
  ];

  for (const path of chromePaths) {
    if (path && existsSync(path)) {
      return path;
    }
  }

  // Try to find in Puppeteer cache with glob-like search
  const puppeteerCacheBase = join(homedir(), '.cache/puppeteer/chrome');
  if (existsSync(puppeteerCacheBase)) {
    try {
      const dirs = readdirSync(puppeteerCacheBase);
      for (const dir of dirs) {
        if (dir.startsWith('linux-')) {
          const chromePath = join(puppeteerCacheBase, dir, 'chrome-linux64', 'chrome');
          if (existsSync(chromePath)) {
            return chromePath;
          }
        }
      }
    } catch (e) {
      console.warn('Error searching Puppeteer cache:', e);
    }
  }

  return null;
}

async function getBrowser() {
  if (!browser) {
    try {
      // Try to find Chrome executable
      let executablePath = findChrome();

      if (!executablePath) {
        // Fallback to Puppeteer's own executable path detection
        try {
          const { executablePath: puppeteerPath } = await import('puppeteer');
          executablePath = puppeteerPath();
        } catch (e) {
          console.warn('Could not get Puppeteer executable path:', e);
        }
      }

      const launchOptions: any = {
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
      };

      if (executablePath) {
        launchOptions.executablePath = executablePath;
      }

      browser = await puppeteer.launch(launchOptions);
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
    const { html, title = 'resume' } = await request.json();

    if (!html) {
      console.error('No HTML content provided');
      return NextResponse.json({ error: 'HTML content is required' }, { status: 400 });
    }

    const browserInstance = await getBrowser();
    page = await browserInstance.newPage();
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
