import { NextRequest, NextResponse } from 'next/server';
import { routing } from './i18n/routing';
import { hasLocale } from 'next-intl';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const localeMatch = pathname.match(/\/dashboard\/document\/[^/]+\/([^/]+)/);

  if (localeMatch && localeMatch[1]) {
    const urlLocale = localeMatch[1];
    if (hasLocale(routing.locales, urlLocale)) {
      const response = NextResponse.next();
      response.headers.set('x-next-intl-locale', urlLocale);
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
