import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import bcrypt from "bcryptjs";
import { ObjectId } from "mongodb";

export async function PUT(req: Request) {
  const { userId, oldPassword, newPassword } = await req.json();
  if (!userId || !oldPassword || !newPassword) {
    return NextResponse.json({ error: "Thiếu thông tin" }, { status: 400 });
  }
  const db = await getDb("my-ai-grader");
  const user = await db.collection("User").findOne({ _id: new ObjectId(userId) });
  if (!user) {
    return NextResponse.json({ error: "Không tìm thấy user" }, { status: 404 });
  }
  const ok = await bcrypt.compare(oldPassword, user.password);
  if (!ok) {
    return NextResponse.json({ error: "Mật khẩu cũ không đúng" }, { status: 401 });
  }
  const hash = await bcrypt.hash(newPassword, 10);
  await db.collection("User").updateOne(
    { _id: new ObjectId(userId) },
    { $set: { password: hash } }
  );
  return NextResponse.json({ success: true });
}
