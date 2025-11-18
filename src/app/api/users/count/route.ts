import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

export async function GET() {
  try {
    const db = await getDb("my-ai-grader");
    const userCount = await db.collection("User").countDocuments();

    return NextResponse.json({ count: userCount });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}