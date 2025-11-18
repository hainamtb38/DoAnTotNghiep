import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { username, email, password, role } = await req.json();
    if (!username || !password) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }
    const db = await getDb("my-ai-grader");
    const existing = await db.collection("User").findOne({ username });
    if (existing) {
      return NextResponse.json({ error: "User already exists" }, { status: 409 });
    }
    const hashed = await bcrypt.hash(password, 10);
    const result = await db.collection("User").insertOne({
      username,
      email,
      password: hashed,
      role: role || "student",
      userId: null, // Tạm thời để null, sẽ cập nhật sau
      createdAt: new Date(),
    });

    // Cập nhật userId sau khi có _id
    const userId = result.insertedId.toString();
    await db.collection("User").updateOne(
      { _id: result.insertedId },
      { $set: { userId } }
    );

    return NextResponse.json({
      user: {
        id: result.insertedId,
        userId, // Trả về userId
        username,
        email,
        role: role || "student",
      },
    });
  } catch (err: any) {
    if (err?.code === "P2002") {
      return NextResponse.json({ error: "User already exists" }, { status: 409 });
    }
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
