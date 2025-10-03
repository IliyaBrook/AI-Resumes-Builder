import { NextRequest, NextResponse } from 'next/server';
import { preparePage } from '@/lib/browser-utils';

function cleanHTML(html: string): string {
  // Remove base64 font data to reduce file size
  let cleanedHTML = html.replace(/src:\s*url\(data:font\/[^;]+;base64,[^)]+\)/gi, '');

  // Remove other unnecessary data URLs that don't affect rendering
  cleanedHTML = cleanedHTML.replace(/url\(data:image\/svg\+xml;base64,[^)]{200,}\)/gi, '');

  // Remove empty style attributes
  cleanedHTML = cleanedHTML.replace(/style=""\s*/gi, '');

  // Remove comments
  cleanedHTML = cleanedHTML.replace(/<!--[\s\S]*?-->/g, '');

  // Remove excessive whitespace
  cleanedHTML = cleanedHTML.replace(/\s{2,}/g, ' ');

  return cleanedHTML;
}

export async function POST(request: NextRequest) {
  let page = null;

  try {
    const { html, title = 'resume' } = await request.json();

    if (!html) {
      console.error('No HTML content provided');
      return NextResponse.json({ error: 'HTML content is required' }, { status: 400 });
    }

    page = await preparePage(html);

    // Get the rendered HTML with computed styles
    const renderedHTML = await page.evaluate(() => {
      // Get all elements
      const allElements = document.querySelectorAll('*');

      // Inline critical styles only (colors, layout, fonts)
      allElements.forEach((element: Element) => {
        const htmlElement = element as HTMLElement;
        const computedStyle = window.getComputedStyle(htmlElement);

        // Only inline essential styles
        const criticalStyles = [
          'color',
          'background-color',
          'font-size',
          'font-weight',
          'font-family',
          'margin',
          'padding',
          'width',
          'height',
          'display',
          'position',
          'border',
          'text-align',
          'line-height',
        ];

        const styleString = criticalStyles
          .map(prop => {
            const value = computedStyle.getPropertyValue(prop);
            return value ? `${prop}: ${value};` : '';
          })
          .filter(Boolean)
          .join(' ');

        if (styleString) {
          htmlElement.setAttribute('style', styleString);
        }
      });

      return document.documentElement.outerHTML;
    });

    // Clean the HTML
    const finalHTML = cleanHTML(`<!DOCTYPE html>${renderedHTML}`);

    return new NextResponse(finalHTML, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `attachment; filename="${title}.html"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
      },
    });
  } catch (error) {
    console.error('HTML generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate HTML', details: error instanceof Error ? error.message : 'Unknown error' },
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
