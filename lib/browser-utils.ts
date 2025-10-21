import puppeteer, { Browser, Page } from 'puppeteer';
import { existsSync, readdirSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

let browser: Browser | null = null;

function findChrome(): string | null {
  // Common Chrome paths for different platforms and installations
  const chromePaths = [
    // Environment variable (highest priority)
    process.env.CHROME_EXECUTABLE_PATH,
    process.env.PUPPETEER_EXECUTABLE_PATH,

    // Alpine Linux / Docker Chromium
    '/usr/bin/chromium-browser',
    '/usr/bin/chromium',

    // Puppeteer cache locations
    join(homedir(), '.cache/puppeteer/chrome/linux-*/chrome-linux64/chrome'),
    join(homedir(), '.local/share/puppeteer/chrome/linux-*/chrome-linux64/chrome'),

    // System Chrome installations
    '/usr/bin/google-chrome-stable',
    '/usr/bin/google-chrome',
    '/opt/google/chrome/google-chrome',

    // Snap installations
    '/snap/bin/chromium',
    '/var/lib/snapd/desktop/applications/chromium_chromium.desktop',
  ];

  for (const path of chromePaths) {
    if (path && existsSync(path)) {
      console.log('Found Chrome at:', path);
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
            console.log('Found Chrome in Puppeteer cache:', chromePath);
            return chromePath;
          }
        }
      }
    } catch (e) {
      console.warn('Error searching Puppeteer cache:', e);
    }
  }

  console.warn('Chrome executable not found in any known location');
  return null;
}

export async function getBrowser(): Promise<Browser> {
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

export function closeBrowser(): void {
  if (browser) {
    void browser.close();
    browser = null;
  }
}

export async function preparePage(html: string): Promise<Page> {
  const browserInstance = await getBrowser();
  const page = await browserInstance.newPage();
  await page.setViewport({ width: 794, height: 1123 });

  // Set the HTML content
  await page.setContent(html, {
    waitUntil: ['domcontentloaded', 'networkidle0'],
    timeout: 30000,
  });

  // Wait for fonts and images to load
  await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 2000)));

  return page;
}

// Cleanup on process exit
process.on('exit', closeBrowser);
