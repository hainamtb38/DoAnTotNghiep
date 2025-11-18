import { NextResponse } from "next/server";
import { getMongoClient } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { Readable } from "stream";

// Helper: chuyển Node.js Readable stream sang Web ReadableStream
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

// export async function GET(req: Request, { params }: { params: { id: string } }) {
//   const { id } = params;
export async function GET(req: Request, context: { params: any }) {
  // await context.params nếu Next.js báo như vậy
  const params = await context.params; // ⚡ bắt buộc nếu báo await
  const id = params.id;  
    // ✅ Ngay đầu, đầu tiên trong hàm
  // console.log("GET handler called!");
  // console.log("req.url:", req.url);
  // console.log("params:", params);
  //console.log("params.id:", params.id);

  if (!id) {
    return NextResponse.json({ error: "Missing file ID" }, { status: 400 });
  }
  const client = await getMongoClient();
  const db = client.db("my-ai-grader");
  const { GridFSBucket } = await import("mongodb");
  const bucket = new GridFSBucket(db, { bucketName: "submissionsFiles" });

  try {
    // Lấy submission nếu id là _id của submission
    const submission = await db.collection("submissions").findOne({ _id: new ObjectId(id) });

    // Xác định fileId / _id cho GridFS
    // Nếu submission tồn tại → dùng submission.fileId (ObjectId sẵn)
    // Nếu không → convert id string sang ObjectId (trường hợp test trực tiếp với fileId)
    //const fileId: ObjectId = submission?.fileId ?? new ObjectId(id);
    const fileId: ObjectId = submission ? new ObjectId(submission.fileId) : new ObjectId(id);

    // Log thông tin fileId và bucket name
    console.log("fileId:", fileId, "Type:", typeof fileId);
    console.log("GridFS Bucket Name:", "submissionsFiles");
    //console.log("submission.fileId:", submission.fileId, typeof submission.fileId);

    // Lấy metadata file
    const fileDoc = await db.collection("submissionsFiles.files").findOne({ _id: fileId });
    if (!fileDoc) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    // Mở stream GridFS
    const downloadStream = bucket.openDownloadStream(fileId);

    // Chuyển Node stream sang Web ReadableStream
    const webStream = nodeStreamToWeb(downloadStream);

    return new Response(webStream, {
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": `attachment; filename="${encodeURIComponent(
          fileDoc.filename
        )}"`,
      },
    });
  } catch (err) {
    console.error("Download error:", err);
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }
}