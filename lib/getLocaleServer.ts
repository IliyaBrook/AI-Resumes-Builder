import { db } from '@/db';
import { documentTable } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function getDocumentLocale(documentId: string): Promise<string> {
  try {
    if (!documentId) {
      console.warn('getDocumentLocale: documentId is required');
      return 'en';
    }

    const document = await db
      .select({ locale: documentTable.locale })
      .from(documentTable)
      .where(eq(documentTable.documentId, documentId))
      .limit(1);

    const locale = document[0]?.locale;

    if (locale && ['en', 'he'].includes(locale)) {
      return locale;
    }

    console.warn(`getDocumentLocale: Invalid or missing locale for document ${documentId}, using fallback 'en'`);
    return 'en';
  } catch (error) {
    console.error(`Error fetching locale for document ${documentId}:`, error);
    return 'en';
  }
}

export async function getUserPreferredLocale(): Promise<string> {
  try {
    const lastDocument = await db
      .select({ locale: documentTable.locale })
      .from(documentTable)
      .orderBy(documentTable.updatedAt)
      .limit(1);

    const locale = lastDocument[0]?.locale;

    if (locale && ['en', 'he'].includes(locale)) {
      return locale;
    }

    return 'en';
  } catch (error) {
    console.error('Error fetching user preferred locale:', error);
    return 'en';
  }
}
