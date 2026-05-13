'use client';

import React from 'react';
import { createRoot, Root } from 'react-dom/client';
import { NextIntlClientProvider } from 'next-intl';
import { ResumeContentBase } from '@/app/(home)/dashboard/document/[documentId]/[locale]/edit/EditResume/shared/ResumeContentBase';
import { getPagePrintStyles } from '@/app/(home)/dashboard/document/[documentId]/[locale]/edit/EditResume/shared/styles';
import RESUME_STYLES from '../../shared/resume-styles.css?inline';

export const loadMessages = async (locale: string) => {
  try {
    const messages = await import(`@/messages/${locale}.json`);
    return messages.default;
  } catch {
    const messages = await import(`@/messages/en.json`);
    return messages.default;
  }
};

export const collectStylesheets = async (): Promise<string[]> => {
  const stylesheets: string[] = [RESUME_STYLES];
  const linkElements = document.querySelectorAll('link[rel="stylesheet"]');
  for (const link of linkElements) {
    try {
      const href = (link as HTMLLinkElement).href;
      if (href && (href.startsWith(window.location.origin) || href.startsWith('/'))) {
        const response = await fetch(href);
        const css = await response.text();
        stylesheets.push(css);
      }
    } catch (e) {
      console.warn('Could not load stylesheet:', e);
    }
  }
  return stylesheets;
};

interface RenderResumeOptions {
  containerId: string;
  fixedResumeInfo: any;
  pagesOrder: string[];
  themeColor: string;
  locale: string;
  messages: unknown;
}

export interface RenderedResume {
  resumeElement: Element;
  tempContainer: HTMLDivElement;
  root: Root;
  cleanup: () => void;
}

export const renderResumeToTempContainer = async ({
  containerId,
  fixedResumeInfo,
  pagesOrder,
  themeColor,
  locale,
  messages,
}: RenderResumeOptions): Promise<RenderedResume> => {
  const tempContainer = document.createElement('div');
  tempContainer.id = containerId;
  tempContainer.style.position = 'absolute';
  tempContainer.style.left = '-9999px';
  tempContainer.style.width = '210mm';
  document.body.appendChild(tempContainer);

  const root = createRoot(tempContainer);
  await new Promise<void>(resolve => {
    root.render(
      <NextIntlClientProvider messages={messages as Record<string, never>} locale={locale}>
        <ResumeContentBase
          resumeInfo={fixedResumeInfo}
          pagesOrder={pagesOrder}
          themeColor={themeColor}
          isLoading={false}
          isInteractive={false}
          containerProps={{
            id: 'resume-content',
            ...getPagePrintStyles(themeColor),
          }}
        />
      </NextIntlClientProvider>
    );
    setTimeout(resolve, 100);
  });

  const cleanup = () => {
    root.unmount();
    if (document.body.contains(tempContainer)) {
      document.body.removeChild(tempContainer);
    }
  };

  const resumeElement = tempContainer.querySelector('#resume-content');
  if (!resumeElement) {
    cleanup();
    throw new Error('Could not render resume content');
  }

  return { resumeElement, tempContainer, root, cleanup };
};

export const downloadBlob = (blob: Blob, fileName: string) => {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
};
