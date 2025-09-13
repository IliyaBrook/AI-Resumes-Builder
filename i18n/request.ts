import { getRequestConfig } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { routing } from './routing';
import { headers } from 'next/headers';

export default getRequestConfig(async ({ requestLocale }) => {
  // Try to get locale from custom header set by middleware
  let locale = routing.defaultLocale;

  try {
    const headersList = await headers();
    const middlewareLocale = headersList.get('x-next-intl-locale');

    // Use locale from middleware if available and valid
    if (middlewareLocale && hasLocale(routing.locales, middlewareLocale)) {
      locale = middlewareLocale;
    } else {
      // Fallback to requestLocale for standard next-intl routing
      const requested = await requestLocale;
      if (requested && hasLocale(routing.locales, requested)) {
        locale = requested;
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
