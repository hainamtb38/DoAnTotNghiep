import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

export async function PUT(req: Request) {
  const { userId, username, email } = await req.json();
  if (!userId || !username || !email) {
    return NextResponse.json({ error: "Thiếu thông tin" }, { status: 400 });
  }
  const db = await getDb("my-ai-grader");
  await db.collection("User").updateOne(
    { _id: typeof userId === "string" ? new (await import("mongodb")).ObjectId(userId) : userId },
    { $set: { username, email } }
  );
  return NextResponse.json({ success: true });
}
