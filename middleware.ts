import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  // Match all pathnames except for
  // - …files (favicon.ico, sitemap.xml, ...)
  // - …static files (_next/static/…)
  // - …internal Next.js routes (/api/…)
  matcher: ['/', '/(he|en)/:path*'],
};
