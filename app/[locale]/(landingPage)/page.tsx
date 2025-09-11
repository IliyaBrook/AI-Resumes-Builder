import { redirect } from 'next/navigation';

export default async function LocaleRootPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  // Redirect to dashboard with proper locale
  redirect(`/${locale}/dashboard`);
  return null;
}
