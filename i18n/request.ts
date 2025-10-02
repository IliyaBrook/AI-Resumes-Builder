import { getRequestConfig } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { routing } from './routing';
import { headers } from 'next/headers';

export default getRequestConfig(async ({ requestLocale }) => {
  // Try to get locale from custom header set by middleware
  let locale = routing.defaultLocale;

  try {
    // Try to get locale from requestLocale first (works for both static and dynamic)
    const requested = await requestLocale;
    if (requested && hasLocale(routing.locales, requested)) {
      locale = requested;
    } else {
      // Try headers only if requestLocale is not available
      try {
        const headersList = await headers();
        const middlewareLocale = headersList.get('x-next-intl-locale');

        if (middlewareLocale && hasLocale(routing.locales, middlewareLocale)) {
          locale = middlewareLocale;
        }
      } catch {
        // Headers not available during static generation, use default locale
      }
    }
  } catch (error) {
    // Final fallback to default locale
    console.error('Error getting locale:', error);
  }

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
