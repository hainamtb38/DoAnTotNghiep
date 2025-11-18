import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url!);
  const userId = searchParams.get("userId");
  if (!userId) return NextResponse.json({ error: "Thiếu userId" }, { status: 400 });
  console.log("[STATS API] userId query:", userId);
  const db = await getDb("my-ai-grader");
  // Đếm bài nộp với userId dạng string hoặc số (tương thích dữ liệu lưu)
  let userIdQuery: any = [ { userId } ];
  // Nếu userId là ObjectId dạng string, thêm điều kiện so sánh ObjectId
  if (/^[a-fA-F0-9]{24}$/.test(userId)) {
    userIdQuery.push({ userId: new ObjectId(userId) });
  }
  const submitted = await db.collection("submissions").countDocuments({ $or: userIdQuery });
  // Lấy điểm trung bình các bài đã nộp (nếu có trường score)
  const scores = await db.collection("submissions").find({
    $or: userIdQuery,
    score: { $ne: null }
  }).toArray();
  const score = scores.length ? (scores.reduce((acc, a) => acc + (a.score || 0), 0) / scores.length).toFixed(2) : 0;
  // Tiến độ học tập (giả lập: số bài đã nộp / 10 * 100)
  const progress = Math.min(100, Math.round((submitted / 10) * 100));
  return NextResponse.json({ progress, score, submitted });
}
