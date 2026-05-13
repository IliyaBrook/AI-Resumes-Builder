import dynamic from 'next/dynamic';

export const Download = dynamic(() => import('./Download'), {
  ssr: false,
});
