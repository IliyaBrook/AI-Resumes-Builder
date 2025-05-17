import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/index";
import { modelTable } from "@/db/schema/model";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const result = await db.select().from(modelTable);
  if (result.length > 0) {
    return NextResponse.json({ modelName: result[0].modelName });
  }
  return NextResponse.json({ modelName: "gemini-1.5-flash" });
}

export async function POST(req: NextRequest) {
  const { modelName } = await req.json();
  const existing = await db.select().from(modelTable);
  if (existing.length > 0) {
    await db.update(modelTable).set({ modelName }).where(eq(modelTable.id, existing[0].id));
  } else {
    await db.insert(modelTable).values({ modelName });
  }
  return NextResponse.json({ modelName });
} 