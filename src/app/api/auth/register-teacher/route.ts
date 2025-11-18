import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { username, email, password, phone } = await req.json();

    if (!username || !email || !password || !phone) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const db = await getDb("my-ai-grader");

    // Kiểm tra email trùng lặp
    const existingEmail = await db.collection("User").findOne({ email });
    if (existingEmail) {
      return NextResponse.json({ error: "Email already exists" }, { status: 409 });
    }

    // Kiểm tra số điện thoại hợp lệ
    const phoneRegex = /^[0-9]{10,15}$/;
    if (!phoneRegex.test(phone)) {
      return NextResponse.json({ error: "Invalid phone number" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await db.collection("User").insertOne({
      username,
      email,
      password: hashedPassword,
      phone,
      role: "teacher",
      createdAt: new Date(),
    });

    return NextResponse.json({
      user: {
        id: result.insertedId,
        username,
        email,
        phone,
        role: "teacher",
      },
    });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}