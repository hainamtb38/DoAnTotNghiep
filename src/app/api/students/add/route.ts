import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { username, email, password } = await req.json();

    if (!username || !email || !password) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const db = await getDb("my-ai-grader");

    const existingEmail = await db.collection("User").findOne({ email });
    if (existingEmail) {
      return NextResponse.json({ error: "Email already exists" }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await db.collection("User").insertOne({
      username,
      email,
      password: hashedPassword,
      role: "student",
      createdAt: new Date(),
    });

    return NextResponse.json({
      user: {
        id: result.insertedId,
        username,
        email,
        role: "student",
      },
    });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}