import dynamic from 'next/dynamic';

export { default as ThemeColor } from './ThemeColor';
export { default as TopSection } from './TopSection';
export { default as ResumeTitle } from './ResumeTitle';
export { default as MoreOption } from './MoreOption';

export const Download = dynamic(() => import('./Download'), {
  ssr: false,
});
