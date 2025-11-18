import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";
import { getDb } from "@/lib/mongodb";

const JWT_SECRET = process.env.JWT_SECRET || "my_super_secret_key";
const secret = new TextEncoder().encode(JWT_SECRET);

export async function POST(req: Request) {
  const body = await req.json();
  //console.log('[login route] POST body:', { email: body.email });
  const { email, password } = body;
  if (!email || !password) {
    return NextResponse.json({ error: "Thiếu email hoặc mật khẩu" }, { status: 400 });
  }

  const db = await getDb("my-ai-grader");
  const user = await db.collection("User").findOne({ email });
  if (!user) {
    return NextResponse.json({ error: "Thông tin đăng nhập không hợp lệ" }, { status: 401 });
  }

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) {
    return NextResponse.json({ error: "Thông tin đăng nhập không hợp lệ" }, { status: 401 });
  }

  const token = await new SignJWT({
    id: user._id.toString(), // Ensure id is serialized as a string
    username: user.username,
    role: user.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(secret);

  return NextResponse.json({
    token,
    user: {
      id: user._id,
      userId: user.userId, // Thêm userId vào phản hồi
      username: user.username,
      email: user.email,
      role: user.role,
    },
  });
}