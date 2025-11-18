import Link from "next/link"

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-100 to-white">
      <h1 className="text-4xl font-bold text-blue-700 mb-4">
        Hệ thống học online ứng dụng AI
      </h1>
      <p className="text-lg text-gray-600 mb-6">
        Học tập thông minh - Chấm bài tự động bằng AI
      </p>
      <div className="space-x-4">
        <Link href="/login" className="px-6 py-3 bg-blue-600 text-white rounded-xl shadow hover:bg-blue-700">
          Đăng nhập
        </Link>
        <Link href="/register" className="px-6 py-3 bg-gray-200 rounded-xl shadow hover:bg-gray-300">
          Đăng ký
        </Link>
      </div>
    </main>
  )
}
