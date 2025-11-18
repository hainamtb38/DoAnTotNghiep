import { NextResponse } from "next/server";
import { getMongoClient } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// GET: Lấy lịch sử điểm số các bài đã nộp của user
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    if (!userId) {
      return NextResponse.json({ error: "Thiếu userId" }, { status: 400 });
    }
    const client = await getMongoClient();
    const db = client.db();
    // Giả sử mỗi submission có trường score
    const submissions = await db
      .collection("submissions")
      .find({ userId })
      .project({ _id: 1, courseId: 1, content: 1, score: 1, submittedAt: 1 })
      .sort({ submittedAt: -1 })
      .toArray();
    return NextResponse.json(submissions);
  } catch (e) {
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
