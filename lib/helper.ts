import { v4 as uuidv4 } from 'uuid';
import html2canvas from 'html2canvas-pro';

export const INITIAL_THEME_COLOR = '#7c3aed';

export const generateDocUUID = (): string => {
  const uuid = uuidv4().replace(/-/g, '');
  return `doc-${uuid.substring(0, 16)}`;
};

export const generateThumbnail = async () => {
  const resumeElement = document.getElementById('resume-preview-id') as HTMLElement;
  if (!resumeElement) {
    console.error('Resume preview element not found');
    return;
  }

  try {
    const canvas = await html2canvas(resumeElement, { scale: 0.5 });
    return canvas.toDataURL('image/png');
  } catch (error) {
    console.error('Thumbnail generation failed', error);
  }
};

export const formatFileName = (title: string, useHyphen: boolean = true) => {
  const delimiter = useHyphen ? '-' : '_';
  let name = title.trim().replace(/\s+/g, delimiter);
  if (!name.toLowerCase().endsWith('.pdf')) {
    name += '.pdf';
  }
  return name;
};

export const GITHUB_BASE_URL = 'https://github.com';
export const LINKEDIN_BASE_URL = 'https://www.linkedin.com/in';

export const normalizeProfileUrl = (value: string | undefined | null, defaultBase: string): string => {
  if (!value) return '';
  const trimmed = value.trim();
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (trimmed.startsWith('//')) return `https:${trimmed}`;
  if (/^[a-z0-9-]+\.[a-z]/i.test(trimmed)) return `https://${trimmed}`;
  return `${defaultBase.replace(/\/$/, '')}/${trimmed.replace(/^\//, '')}`;
};
