import { NextResponse } from 'next/server';
import { GridFSBucket } from 'mongodb';
import { getMongoClient } from '@/lib/mongodb';

export async function POST(request: Request) {
  try {
    console.log("[POST /api/upload] Received request");
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const userId = formData.get('userId') as string;
    const courseId = formData.get('courseId') as string;
    const sessionRaw = formData.get('session') as string;
    const session = parseInt(sessionRaw, 10);

    console.log("[POST /api/upload] Extracted fields:", {
      file: file ? file.name : null,
      fileType: file ? file.type : null,
      fileSize: file ? file.size : null,
      userId,
      courseId,
      sessionRaw,
      session,
    });

    if (!file || !userId || !courseId || isNaN(session)) {
      console.error("[POST /api/upload] Missing or invalid fields", {
        file: file ? file.name : null,
        userId,
        courseId,
        sessionRaw,
        session,
      });
      return NextResponse.json({ error: 'Missing or invalid fields' }, { status: 400 });
    }

    const client = await getMongoClient();
    const db = client.db('my-ai-grader');
    const bucket = new GridFSBucket(db, { bucketName: 'submissionsFiles' });

    console.log("[POST /api/upload] Uploading file to GridFS");
    const uploadStream = bucket.openUploadStream(file.name, {
      metadata: { userId, courseId, session, uploadedAt: new Date() },
    });
    const fileBuffer = Buffer.from(await file.arrayBuffer());

    await new Promise<void>((resolve, reject) => {
      uploadStream.end(fileBuffer);
      uploadStream.on('finish', resolve);
      uploadStream.on('error', reject);
    });

    console.log("[POST /api/upload] File uploaded to GridFS");
    const fileId = uploadStream.id;

    console.log("[POST /api/upload] Saving metadata to submissions collection");
    const submission = {
      userId,
      courseId,
      session,
      fileName: file.name,
      fileId, // Dùng trực tiếp
      status: 'pending',
      score: null,
      feedback: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection('submissions').insertOne(submission);
    console.log("[POST /api/upload] Metadata saved successfully", result);

    return NextResponse.json({ message: 'File uploaded successfully to GridFS and metadata saved', fileId });
  } catch (error) {
    console.error("[POST /api/upload] Error uploading file to GridFS:", error);
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
  }
}