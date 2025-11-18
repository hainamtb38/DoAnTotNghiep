import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

export async function GET() {
  try {
    const db = await getDb("my-ai-grader");
    const assignments = await db.collection("Assignment").find().toArray();

    return NextResponse.json({ assignments });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}