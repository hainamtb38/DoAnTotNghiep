import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const { userId, courseId, title, content } = await req.json();
  if (!userId || !title) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  // LƯU bài
  const assignment = await prisma.assignment.create({
    data: { title, content, userId, courseId },
  });

  // MOCK AI grading: giả lập chấm điểm và feedback
  const score = Math.round((Math.random() * 5 + 5) * 10) / 10; // 5.0 - 10.0
  const feedback = `AI feedback mẫu: Bài làm rõ ràng. Điểm: ${score}`;

  const graded = await prisma.assignment.update({
    where: { id: assignment.id },
    data: { score, feedback },
  });

  return NextResponse.json({ assignment: graded });
}
