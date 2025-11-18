import { GridFSBucket, BSON } from "mongodb";
import { NextResponse } from "next/server";
import { getMongoClient } from "@/lib/mongodb";
import { verifyToken } from "@/lib/auth"; // Thêm hàm xác thực token
import jwt from "jsonwebtoken";

// Define the User interface
interface User {
  _id: string; // MongoDB ObjectId as a string
  userId?: string; // Optional userId field
  username: string;
  role: string;
}

// DELETE: Xóa bài nộp
export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    const { _id } = body;

    if (!_id) {
      return NextResponse.json({ error: "Thiếu _id" }, { status: 400 });
    }

    const client = await getMongoClient();
    const db = client.db("my-ai-grader"); // Khai báo rõ ràng database
    const result = await db.collection("submissions").deleteOne({ _id: new BSON.ObjectId(_id) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Không tìm thấy bài nộp" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("[DELETE /api/submissions] Error:", e);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}

// PUT: Cập nhật nội dung bài nộp
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { _id, content } = body;

    if (!_id || !content) {
      return NextResponse.json({ error: "Thiếu thông tin" }, { status: 400 });
    }

    const client = await getMongoClient();
    const db = client.db("my-ai-grader");

    const result = await db.collection("submissions").updateOne(
      { _id: new BSON.ObjectId(_id) },
      { $set: { content, updatedAt: new Date() } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Không tìm thấy bài nộp" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("[PUT /api/submissions] Error:", e);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}

// POST: Upload file và lưu metadata
export async function POST(req: Request) {
  try {
    console.log("[POST /api/submissions] Received request");

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const userId = formData.get("userId") as string;
    const courseId = formData.get("courseId") as string;
    const sessionRaw = formData.get("session") as string;
    const session = parseInt(sessionRaw, 10);

    console.log("[POST /api/submissions] Extracted fields:", {
      file: file ? file.name : null,
      userId, // Updated from studentId
      courseId,
      sessionRaw,
      session,
    });

    if (!file || !userId || !courseId || isNaN(session)) {
      console.error("[POST /api/submissions] Missing or invalid fields");
      return NextResponse.json({ error: "Thiếu hoặc sai thông tin" }, { status: 400 });
    }

    const client = await getMongoClient();
    const db = client.db("my-ai-grader");
    const bucket = new GridFSBucket(db, { bucketName: "submissionsFiles" });

    console.log("[POST /api/submissions] Uploading file to GridFS...");

    const uploadStream = bucket.openUploadStream(file.name, {
      metadata: { userId, courseId, session, uploadedAt: new Date() },
    });

    const buffer = Buffer.from(await file.arrayBuffer());

    // Đợi sự kiện "finish" để đảm bảo file được lưu xong
    await new Promise<void>((resolve, reject) => {
      uploadStream.on("finish", resolve);
      uploadStream.on("error", reject);
      uploadStream.end(buffer);
    });

    console.log("[POST /api/submissions] File uploaded, fileId:", uploadStream.id);

    // Lưu metadata vào collection "submissions"
    const submission = {
      userId, // Updated from studentId
      courseId,
      session,
      fileName: file.name,
      fileId: uploadStream.id,
      status: "pending",
      score: null,
      feedback: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("submissions").insertOne(submission);
    console.log("[POST /api/submissions] Metadata inserted:", result.insertedId);

    return NextResponse.json({
      success: true,
      message: "File uploaded successfully",
      fileId: uploadStream.id,
    });
  } catch (error) {
    console.error("[POST /api/submissions] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// GET: Lấy danh sách hoặc tải file cụ thể
export async function GET(req: Request) {
  try {
    const token = req.headers.get("Authorization")?.split(" ")[1]; // Lấy token từ header
    //console.log("Received Token:", token); // Log token để kiểm tra

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token) as { userId?: string; id?: string }; // Xác thực và giải mã token
    //console.log("Decoded Token:", decoded); // Log kết quả giải mã

    if (!decoded || (!decoded.userId && !decoded.id)) {
      return NextResponse.json({ error: "Invalid token" }, { status: 403 });
    }

    const userId = decoded.userId || decoded.id; // Fallback sang id nếu userId không tồn tại

    const client = await getMongoClient();
    const db = client.db("my-ai-grader");

    console.log("Querying submissions with userId:", userId); // Log userId

    const submissions = await db
      .collection("submissions")
      .find({ userId }) // userId là chuỗi
      .sort({ createdAt: -1 })
      .toArray();

    //console.log("Submissions Query Result:", submissions); // Log kết quả truy vấn

    return NextResponse.json(submissions);
  } catch (error) {
    console.error("[GET /api/submissions] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in the environment variables.");
}

const JWT_SECRET = process.env.JWT_SECRET; // Gán cho biến local, TypeScript biết chắc chắn

export function generateToken(user: User) {
  const payload = {
    id: user._id,                  // MongoDB ObjectId
    userId: user.userId || user._id,  // ID riêng nếu có, không thì fallback sang _id
    username: user.username,
    role: user.role,
  };

  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" }); // Dùng biến local
}
