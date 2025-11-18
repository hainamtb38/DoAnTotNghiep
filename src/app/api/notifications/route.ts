import { NextResponse } from "next/server";
import { getMongoClient } from "@/lib/mongodb";

// POST: Gửi thông báo/feedback mới
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, message, from = "system" } = body;
    if (!userId || !message) {
      return NextResponse.json({ error: "Thiếu thông tin" }, { status: 400 });
    }
    const client = await getMongoClient();
    const db = client.db();
    const notification = {
      userId,
      message,
      from,
      createdAt: new Date(),
      read: false,
    };
    await db.collection("notifications").insertOne(notification);
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}

// GET: Lấy danh sách thông báo của user
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    if (!userId) {
      return NextResponse.json({ error: "Thiếu userId" }, { status: 400 });
    }
    const client = await getMongoClient();
    const db = client.db();
    const notifications = await db
      .collection("notifications")
      .find({ userId })
      .sort({ createdAt: -1 })
      .limit(10)
      .toArray();
    return NextResponse.json(notifications);
  } catch (e) {
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
