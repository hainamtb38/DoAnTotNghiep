import { NextResponse } from "next/server";
import { getMongoClient } from "@/lib/mongodb";
import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";

const SECRET = process.env.JWT_SECRET || "supersecretkey";

// Define the User interface locally
interface User {
  _id: string; // MongoDB ObjectId as a string
  userId?: string; // Optional userId field
  username: string;
  role: string;
}

export async function GET(req: Request) {
  const token = req.headers.get("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Decode token and fetch user info (assuming token contains userId)
    const userId = decodeToken(token); // Replace with actual token decoding logic

    const client = await getMongoClient();
    const db = client.db("my-ai-grader");

    const teacher = await db.collection("User").findOne(
      { _id: new ObjectId(userId) },
      { projection: { userId: 1, _id: 1, username: 1, role: 1 } }
    );

    if (!teacher) {
      return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
    }

    return NextResponse.json({ teacher });
  } catch (error) {
    console.error("Error fetching teacher info:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

function decodeToken(token: string): string {
  try {
    const payload = jwt.verify(token, SECRET) as { id: string };
    return payload.id; // Return userId from token
  } catch (err) {
    throw new Error("Invalid token");
  }
}

export function generateToken(user: User) {
  const payload = {
    id: user._id,                  // MongoDB ObjectId
    userId: user.userId || user._id,  // ID riêng nếu có, không thì fallback sang _id
    username: user.username,
    role: user.role,
  };

  return jwt.sign(payload, SECRET, { expiresIn: "7d" }); // Dùng biến local
}