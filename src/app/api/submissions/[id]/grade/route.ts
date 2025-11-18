import { NextResponse } from "next/server";
import { getMongoClient } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import axios, { AxiosResponse } from "axios";
import { Readable } from "stream";

// Helper: Chuyển Node.js Readable stream sang Web ReadableStream
function nodeStreamToWeb(stream: Readable): ReadableStream<Uint8Array> {
  const reader = stream[Symbol.asyncIterator]();
  return new ReadableStream({
    async pull(controller) {
      try {
        const { value, done } = await reader.next();
        if (done) {
          controller.close();
        } else {
          controller.enqueue(new Uint8Array(value));
        }
      } catch (err) {
        controller.error(err);
      }
    },
    cancel() {
      stream.destroy();
    },
  });
}

export async function POST(req: Request, context: { params: any }) {
  const params = await context.params;
  const id = params.id;

  if (!id) {
    return NextResponse.json({ error: "Missing submission ID" }, { status: 400 });
  }

  const client = await getMongoClient();
  const db = client.db("my-ai-grader");
  const { GridFSBucket } = await import("mongodb");
  const bucket = new GridFSBucket(db, { bucketName: "submissionsFiles" });

  try {
    // Tìm bài nộp
    const submission = await db.collection("submissions").findOne({ _id: new ObjectId(id) });
    if (!submission) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 });
    }

    // Cập nhật trạng thái thành "grading"
    await db.collection("submissions").updateOne(
      { _id: new ObjectId(id) },
      { $set: { status: "grading", updatedAt: new Date() } }
    );

    // Tải file từ GridFS
    const fileId = new ObjectId(submission.fileId);
    const downloadStream = bucket.openDownloadStream(fileId);

    // Chuyển Node.js stream sang Buffer
    const chunks: Buffer[] = [];
    for await (const chunk of downloadStream) {
      chunks.push(chunk);
    }
    const fileBuffer = Buffer.concat(chunks); // Định nghĩa fileBuffer

    // In thông báo xác nhận nội dung file đã được lấy thành công
    console.log('Nội dung file: Đã được lấy thành công');

    // Kiểm tra fileName
    const fileName = submission.fileName;
    if (!fileName) {
      return NextResponse.json({ error: "File name is missing or invalid" }, { status: 400 });
    }

    // Lấy phần mở rộng của file
    const fileExtension = fileName.split('.').pop()?.toLowerCase();
    if (!fileExtension || !["docx", "txt", "py"].includes(fileExtension)) {
      return NextResponse.json({
        error: "Unsupported file format. Supported formats are .docx, .txt, .py",
      }, { status: 400 });
    }

    // Chuyển đổi nội dung file dựa trên định dạng
    let fileContent = "";
    try {
      if (fileExtension === "docx") {
        const mammoth = await import("mammoth");
        const result = await mammoth.extractRawText({ buffer: fileBuffer });
        fileContent = result.value;
      } else if (["txt", "py"].includes(fileExtension)) {
        fileContent = fileBuffer.toString("utf-8");
      }
    } catch (conversionError) {
      return NextResponse.json({ error: "Failed to convert file content" }, { status: 500 });
    }

    // Log nội dung content trước khi gửi sang Perplexity
    console.log("Nội dung content trước khi gửi:", fileContent);

    // Log độ dài content
    console.log("Độ dài content:", fileContent.length);

    // Thêm prompt của user vào nội dung file
    const prompt = "trả lời cực ngắn gọn.";
    const finalContent = `${prompt}\n\n${fileContent}`;

    // Log nội dung finalContent trước khi gửi
    console.log("Nội dung finalContent trước khi gửi:", finalContent);
    console.log("Độ dài finalContent:", finalContent.length);

    // Sử dụng AbortController để xử lý timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 1 phút

    try {
      // Gọi API Perplexity để chấm bài
      const API_KEY = process.env.PERPLEXITY_API_KEY;
      const url = "https://api.perplexity.ai/chat/completions";

      const headers = {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      };

      const data = {
        model: "sonar",
        messages: [
          { role: "system", content: `
          Bạn là trợ lý chấm điểm tự động. Trả lời cực ngắn gọn. Trả lời đúng được 5 điểm mỗi câu, sai được 0 điểm mỗi câu
          Trả về **chỉ JSON hợp lệ**, không thêm markdown, \`\`\`json\`\`\` hay bất kỳ bình luận nào khác.
          Cấu trúc JSON:
          {
            "score": float,
            "feedback": "string"
          }
          ` },
          { role: "user", content: finalContent },
        ],
      };

      const response = await axios.post(url, data, { headers, signal: controller.signal });
      clearTimeout(timeoutId);

      const result = response.data;

      const message = result.choices[0].message.content;
      const model = result.model || "Không rõ";
      const usage = result.usage || {};
      const created_value = result.created;

      let created_time;
      if (typeof created_value === "number") {
        created_time = new Date(created_value * 1000).toISOString();
      } else {
        created_time = created_value || "Không xác định";
      }

      console.log("\n=== 🎯 KẾT QUẢ CHẤM BÀI ===");
      console.log(`🧠 Model dùng:          ${model}`);
      console.log(`⏰ Thời gian tạo:       ${created_time}`);
      console.log(`🪙 Token sử dụng:       ${usage.total_tokens}`);
      console.log(`💰 Chi phí ước tính:    ${usage.cost?.total_cost} USD`);
      console.log(`📊 Kết quả chấm điểm:   ${message}`);

      function extractJsonBlock(text: string) {
        const start = text.indexOf("{");
        const end = text.lastIndexOf("}");
        if (start === -1 || end === -1) return null;
        return text.slice(start, end + 1);
      }

      const jsonBlock = extractJsonBlock(message);
      if (!jsonBlock) {
        throw new Error("Không tìm thấy JSON trong response");
      }

      let parsed;
      try {
        parsed = JSON.parse(jsonBlock);
      } catch (err) {
        console.error("JSON không hợp lệ:", jsonBlock);
        throw err;
      }

      console.log("Score:", parsed.score);
      console.log("Feedback:", parsed.feedback);

      await db.collection("submissions").updateOne(
        { _id: new ObjectId(id) },
        {
          $set: {
            score: parsed.score !== undefined && parsed.score !== null ? parsed.score : null, // Lưu giá trị score từ JSON
            feedback: parsed.feedback, // Lưu giá trị feedback từ JSON
            status: "graded",
            updatedAt: new Date(),
          },
        }
      );

      return NextResponse.json({ score: parsed.score, feedback: parsed.feedback, status: "graded" });
    } catch (error) {
      clearTimeout(timeoutId);
      if (axios.isAxiosError(error)) {
        console.error("❌ Lỗi API:", error.message);
        throw new Error(error.message);
      } else if (error instanceof Error && error.name === "AbortError") {
        console.error("❌ Lỗi: Yêu cầu đã bị hủy do timeout");
        throw new Error("Grading timeout");
      } else {
        console.error("❌ Lỗi không xác định:", error);
        throw error;
      }
    }
  } catch (err) {
    console.error("Grading error:", err);
    return NextResponse.json({ error: "Failed to grade submission" }, { status: 500 });
  }
}