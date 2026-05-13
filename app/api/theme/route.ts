import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { themeTable } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  const theme = await db.select().from(themeTable).orderBy(themeTable.id).limit(1);
  return NextResponse.json({ theme: theme[0]?.theme || 'system' });
}

export async function POST(req: NextRequest) {
  const { theme } = await req.json();
  const current = await db.select().from(themeTable).orderBy(themeTable.id).limit(1);
  if (current.length > 0) {
    await db.update(themeTable).set({ theme }).where(eq(themeTable.id, current[0].id));
  } else {
    await db.insert(themeTable).values({ theme });
  }
  return NextResponse.json({ success: true });
}
