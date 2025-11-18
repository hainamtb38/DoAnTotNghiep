import { NextResponse } from "next/server";
import { getMongoClient } from "@/lib/mongodb";
import { verifyToken } from "@/lib/auth";
import { ObjectId } from "mongodb";

// Define the User interface
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
    // Verify token and check teacher role
    const decoded = verifyToken(token) as User;
    if (!decoded || decoded.role !== "teacher") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const url = new URL(req.url);
    const courseId = url.searchParams.get("courseId");
    const session = url.searchParams.get("session");

    if (!courseId || !session) {
      return NextResponse.json({ error: "Missing courseId or session" }, { status: 400 });
    }

    const client = await getMongoClient();
    const db = client.db("my-ai-grader");

    const submissions = await db.collection("submissions").aggregate([
      {
        $match: {
          courseId: courseId,          // courseId is a string
          session: parseInt(session)   // session is converted to a number
        }
      },
      {
        $addFields: {
          userObjId: { $toObjectId: "$userId" } // Convert userId from string to ObjectId
        }
      },
      {
        $lookup: {
          from: "User",
          localField: "userObjId",
          foreignField: "_id",
          as: "userInfo"
        }
      },
      {
        $unwind: {
          path: "$userInfo",
          preserveNullAndEmptyArrays: true // Keep submissions even if no user is found
        }
      },
      {
        $project: {
          _id: 1,
          userId: 1,
          courseId: 1,
          createdAt: 1,
          score: 1,
          feedback: 1,
          session: 1,
          fileName: 1,
          "userInfo.username": 1 // Include username from userInfo
        }
      }
    ]).toArray();

    return NextResponse.json(submissions);
  } catch (error) {
    console.error("Error fetching submissions:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}