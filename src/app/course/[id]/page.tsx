"use client"

import { useParams } from "next/navigation"

export default function CoursePage() {
  const { id } = useParams()

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Khóa học #{id}</h1>
      <div className="mt-4 space-y-4">
        <div className="bg-white p-4 rounded-xl shadow">📺 Video bài giảng</div>
        <div className="bg-white p-4 rounded-xl shadow">📑 Tài liệu học tập</div>
        <a href="/submit" className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700">
          Nộp bài tập
        </a>
      </div>
    </div>
  )
}
