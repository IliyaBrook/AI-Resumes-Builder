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

    // Extract the resume content with inline styles
    const { content, extractedCSS } = await page.evaluate(() => {
      const resumeContent = document.getElementById('resume-content');
      if (!resumeContent) {
        throw new Error('Resume content not found');
      }

      // Get all elements from the original content (not cloned)
      const originalElements = [resumeContent, ...Array.from(resumeContent.querySelectorAll('*'))];

      // Create a map to store styles for each element by index
      const stylesMap = new Map<number, string>();

      // Compute styles for all original elements
      originalElements.forEach((element, index) => {
        if (!(element instanceof HTMLElement)) return;

        const computedStyle = window.getComputedStyle(element);

        // Get all computed style properties and create inline style
        const importantStyles: string[] = [];
        const styleProps = [
          'display', 'position', 'top', 'right', 'bottom', 'left',
          'width', 'height', 'min-width', 'min-height', 'max-width', 'max-height',
          'margin', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left',
          'padding', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
          'border', 'border-top', 'border-right', 'border-bottom', 'border-left',
          'border-width', 'border-style', 'border-color', 'border-radius',
          'background', 'background-color', 'background-image',
          'color', 'font-family', 'font-size', 'font-weight', 'font-style',
          'line-height', 'letter-spacing', 'text-align', 'text-decoration',
          'text-transform', 'white-space', 'word-break', 'overflow',
          'flex', 'flex-direction', 'flex-wrap', 'justify-content', 'align-items',
          'gap', 'grid', 'grid-template-columns', 'grid-gap',
          'opacity', 'visibility', 'z-index', 'box-shadow', 'transform'
        ];

        styleProps.forEach(prop => {
          const value = computedStyle.getPropertyValue(prop);
          if (value && value !== 'none' && value !== 'normal' && value !== 'auto') {
            // Skip default values
            if (prop === 'border-style' && value === 'none') return;
            if (prop === 'border-width' && value === '0px') return;

            importantStyles.push(`${prop}: ${value}`);
          }
        });

        // Store the style string
        if (importantStyles.length > 0) {
          stylesMap.set(index, importantStyles.join('; ') + ';');
        }
      });

      // Clone the element and apply styles
      const clonedContent = resumeContent.cloneNode(true) as HTMLElement;
      const clonedElements = [clonedContent, ...Array.from(clonedContent.querySelectorAll('*'))];

      // Apply stored styles to cloned elements
      clonedElements.forEach((element, index) => {
        if (!(element instanceof HTMLElement)) return;

        const style = stylesMap.get(index);
        if (style) {
          element.setAttribute('style', style);
        }

        // Remove classes since we have inline styles now
        element.removeAttribute('class');
      });

      // Get CSS for lists and special elements
      const customCSS = `
        /* List styles */
        ul {
          padding-left: 15px;
          line-height: 19px !important;
        }

        ul li,
        ol li {
          position: relative;
          padding-left: 1em !important;
        }

        ul li::before,
        ol li::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0.6em;
          width: 0.4em;
          height: 0.4em;
          background: #222;
          border-radius: 50%;
          display: inline-block;
        }

        /* RTL-specific styles */
        [dir='rtl'] ul,
        [dir='rtl'] ol {
          list-style: revert;
          padding-left: 0;
          padding-right: 15px;
        }

        [dir='rtl'] ul li,
        [dir='rtl'] ol li {
          padding-left: 0 !important;
          padding-right: 1.2em;
          list-style-position: outside;
        }

        [dir='rtl'] ul li::before,
        [dir='rtl'] ol li::before {
          display: none;
        }
      `;

      return {
        content: clonedContent.outerHTML,
        extractedCSS: customCSS,
      };
    });

    // Create clean HTML with only necessary parts
    const finalHTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Resume - ${title}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: 'Open Sans', Arial, sans-serif;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }

    ${extractedCSS}
  </style>
</head>
<body>
  ${content}
</body>
</html>`;

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
