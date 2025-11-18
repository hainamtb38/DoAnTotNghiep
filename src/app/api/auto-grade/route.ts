import { NextResponse } from "next/server";
import { getMongoClient } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

// Hàm giả lập AI chấm bài code
async function autoGradeCode(submission: string, expectedOutput: string): Promise<{score: number, feedback: string}> {
  // Ở bản demo, chỉ so sánh chuỗi output
  if (submission.trim() === expectedOutput.trim()) {
    return { score: 10, feedback: "Đáp án chính xác!" };
  }
  return { score: 5, feedback: "Bài làm chưa đúng hoàn toàn. Hãy kiểm tra lại logic." };
}

// Hàm giả lập AI chấm bài tự luận (gọi OpenAI hoặc HuggingFace thực tế)
async function autoGradeEssay(essay: string, answerKey: string): Promise<{score: number, feedback: string}> {
  const response = await axios.post("https://api.openai.com/v1/completions", {
    prompt: `Đề bài: ${answerKey}\nBài làm: ${essay}\nHãy chấm điểm bài làm này trên thang điểm 10 và đưa ra nhận xét.`,
    model: "text-davinci-003",
    max_tokens: 100,
  }, {
    headers: {
      "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
  });
  const result = response.data.choices[0].text.trim();
  const [score, feedback] = result.split("\n");
  return {
    score: parseFloat(score.replace("Điểm:", "").trim()),
    feedback: feedback.replace("Nhận xét:", "").trim(),
  };
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { submissionId, type, content, answerKey, expectedOutput } = body;
    if (!submissionId || !type || !content) {
      return NextResponse.json({ error: "Thiếu thông tin" }, { status: 400 });
    }
    let result;
    if (type === "code") {
      if (!expectedOutput) return NextResponse.json({ error: "Thiếu expectedOutput" }, { status: 400 });
      result = await autoGradeCode(content, expectedOutput);
    } else if (type === "essay") {
      if (!answerKey) return NextResponse.json({ error: "Thiếu answerKey" }, { status: 400 });
      result = await autoGradeEssay(content, answerKey);
    } else {
      return NextResponse.json({ error: "Loại bài không hợp lệ" }, { status: 400 });
    }
    // Lưu điểm vào submission
    const client = await getMongoClient();
    const db = client.db();
    await db.collection("submissions").updateOne(
      { _id: new ObjectId(submissionId) },
      { $set: { score: result.score, feedback: result.feedback } }
    );
    return NextResponse.json({ success: true, ...result });
  } catch (e) {
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
