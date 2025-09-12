import { getRequestConfig } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { routing } from './routing';
import { headers } from 'next/headers';

export default getRequestConfig(async ({ requestLocale }) => {
  // Try to get locale from custom header set by middleware
  let locale = routing.defaultLocale;
  console.log('Request config - Starting with default locale:', locale);

  try {
    const headersList = await headers();
    const middlewareLocale = headersList.get('x-next-intl-locale');
    console.log('Request config - Middleware locale from header:', middlewareLocale);

    // Use locale from middleware if available and valid
    if (middlewareLocale && hasLocale(routing.locales, middlewareLocale)) {
      locale = middlewareLocale;
      console.log('Request config - Using middleware locale:', locale);
    } else {
      // Fallback to requestLocale for standard next-intl routing
      const requested = await requestLocale;
      console.log('Request config - Requested locale:', requested);
      if (requested && hasLocale(routing.locales, requested)) {
        locale = requested;
        console.log('Request config - Using requested locale:', locale);
      }
    }
  } catch (error) {
    // Final fallback to default locale
    console.error('Error getting locale:', error);
  }

  console.log('Request config - Final locale selected:', locale);
  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
