import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

export async function GET() {
  try {
    const db = await getDb("my-ai-grader");
    const students = await db.collection("User").find({ role: "student" }).toArray();
    return NextResponse.json(students);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}