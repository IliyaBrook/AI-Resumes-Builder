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

    // Extract the resume content and all CSS rules
    const { content, css, utilityClasses } = await page.evaluate(() => {
      const resumeContent = document.getElementById('resume-content');
      if (!resumeContent) {
        throw new Error('Resume content not found');
      }

      // Clone content to modify it
      const clonedContent = resumeContent.cloneNode(true) as HTMLElement;

      // Collect inline styles and find duplicates
      const styleMap = new Map<string, HTMLElement[]>();
      const allElements = [clonedContent, ...Array.from(clonedContent.querySelectorAll('*'))];

      allElements.forEach(el => {
        if (el instanceof HTMLElement && el.hasAttribute('style')) {
          const styleValue = el.getAttribute('style') || '';
          if (styleValue) {
            if (!styleMap.has(styleValue)) {
              styleMap.set(styleValue, []);
            }
            styleMap.get(styleValue)!.push(el);
          }
        }
      });

      // Create utility classes for styles that appear 3+ times
      const generatedClasses: string[] = [];
      let classCounter = 0;

      styleMap.forEach((elements, styleValue) => {
        if (elements.length >= 3) {
          const className = `gen-${classCounter++}`;
          generatedClasses.push(`.${className} { ${styleValue} }`);

          // Replace inline styles with class
          elements.forEach(el => {
            el.removeAttribute('style');
            const existingClasses = el.getAttribute('class') || '';
            el.setAttribute('class', existingClasses ? `${existingClasses} ${className}` : className);
          });
        }
      });

      // Collect all CSS rules from stylesheets
      const allCSSRules: string[] = [];
      const usedSelectors = new Set<string>();

      // Get all classes used in cloned content
      const collectClasses = (element: Element) => {
        if (element.className && typeof element.className === 'string') {
          element.className.split(/\s+/).forEach(cls => {
            if (cls && !cls.startsWith('gen-')) {
              // Skip generated classes
              usedSelectors.add(`.${cls}`);
            }
          });
        }
        Array.from(element.children).forEach(collectClasses);
      };
      collectClasses(clonedContent);

      // Extract CSS rules from all stylesheets
      for (const sheet of Array.from(document.styleSheets)) {
        try {
          const rules = Array.from(sheet.cssRules || []);
          for (const rule of rules) {
            const ruleText = rule.cssText;

            // Skip @font-face rules
            if (ruleText.startsWith('@font-face')) {
              continue;
            }

            // Skip @import and @charset
            if (ruleText.startsWith('@import') || ruleText.startsWith('@charset')) {
              continue;
            }

            // Skip @media rules (we don't need responsive behavior in exported HTML)
            if (ruleText.startsWith('@media')) {
              continue;
            }

            // Skip @keyframes (we don't need animations in exported HTML)
            if (ruleText.startsWith('@keyframes')) {
              continue;
            }

            // Check if this rule is used
            let isUsed = false;

            if (rule instanceof CSSStyleRule) {
              const selector = rule.selectorText;

              // Check if selector matches any used class
              for (const usedSelector of usedSelectors) {
                if (selector.includes(usedSelector)) {
                  isUsed = true;
                  break;
                }
              }

              // Also include element selectors and #resume-content
              if (
                !isUsed &&
                (selector.includes('#resume-content') ||
                  selector.match(/^(body|html|div|p|span|h[1-6]|ul|li|ol|a|hr)\b/))
              ) {
                isUsed = true;
              }
            }

            if (isUsed) {
              allCSSRules.push(ruleText);
            }
          }
        } catch (e) {
          // Skip stylesheets we can't access (CORS)
          console.warn('Could not access stylesheet:', e);
        }
      }

      return {
        content: clonedContent.outerHTML,
        css: allCSSRules.join('\n'),
        utilityClasses: generatedClasses.join('\n'),
      };
    });

    // Create clean HTML with only necessary parts
    const finalHTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Resume - ${title}</title>
  <style>
    /* Base styles */
    * {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      font-family: 'Open Sans', Arial, sans-serif;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      display: flex;
      justify-content: center;
      background-color: #f3f4f6;
    }

    h5 {
      margin: 0;
      padding: 0;
    }

    /* Generated utility classes from repeated inline styles */
    ${utilityClasses}

    /* Extracted CSS from page */
    ${css}
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
