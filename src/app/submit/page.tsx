"use client"
import { useEffect, useState } from "react"

export default function SubmitAssignment() {
  const [file, setFile] = useState<File | null>(null)
  const [feedback, setFeedback] = useState("")
  const [selectedCourse, setSelectedCourse] = useState("Lập trình React")
  const [sessionNumber, setSessionNumber] = useState(1)
  const [userId, setUserId] = useState("")
  const [submissionTime, setSubmissionTime] = useState("")
  const [fileName, setFileName] = useState("")

  useEffect(() => {
    const storedUserId = localStorage.getItem("userId")
    const storedCourse = localStorage.getItem("selectedCourse")
    const storedSession = localStorage.getItem("sessionNumber")

    if (storedUserId) setUserId(storedUserId)
    if (storedCourse) setSelectedCourse(storedCourse)
    if (storedSession) setSessionNumber(parseInt(storedSession, 10))
  }, [])

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setFile(file)
      setFileName(file.name)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) {
      setFeedback("Vui lòng chọn file để nộp.")
      return
    }

    const formData = new FormData()
    formData.append("file", file)
    formData.append("userId", userId)
    formData.append("courseId", selectedCourse)
    formData.append("session", sessionNumber.toString())

    // ==== Xem dữ liệu FormData trước khi gửi ====
    console.log("=== FormData contents ===")
    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        console.log(key, value.name, value.size, value.type)
      } else {
        console.log(key, value)
      }
    }
    console.log("=========================")

    const response = await fetch("/api/submissions", {
      method: "POST",
      body: formData,
    })

    if (!response.ok) {
      setFeedback("Có lỗi xảy ra khi tải lên file.")
      return
    }

    const currentTime = new Date().toLocaleString()
    setSubmissionTime(currentTime)
    setFeedback(
      `Nộp bài thành công!\nKhóa học: ${selectedCourse}\nBuổi học: ${sessionNumber}\nThời gian: ${currentTime}\nFile đã nộp: ${file.name}`
    )

    // Lưu lịch sử nộp bài vào localStorage
    const submissionData = {
      course: selectedCourse,
      session: sessionNumber,
      time: currentTime,
      fileName: file.name,
    }

    const storedHistory = localStorage.getItem("submissionHistory")
    const history = storedHistory ? JSON.parse(storedHistory) : []
    history.push(submissionData)
    localStorage.setItem("submissionHistory", JSON.stringify(history))
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-6">Nộp bài tập</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="mb-4">
            <label className="block text-lg font-medium mb-2">Khóa học</label>
            <input
              type="text"
              value={selectedCourse}
              readOnly
              className="w-full px-3 py-2 border rounded bg-gray-200 focus:outline-none"
            />
          </div>
          <div className="mb-4">
            <label className="block text-lg font-medium mb-2">Buổi học</label>
            <input
              type="number"
              value={sessionNumber}
              readOnly
              className="w-full px-3 py-2 border rounded bg-gray-200 focus:outline-none"
            />
          </div>
          <div className="mb-4">
            <label className="block text-lg font-medium mb-2">Chọn file</label>
            <input
              type="file"
              onChange={handleFileChange}
              className="w-full border p-3 rounded-xl"
            />
          </div>
          {feedback && (
            <div className="mt-6 p-4 bg-green-100 text-green-800 rounded-xl">
              {feedback}
            </div>
          )}
          {!feedback && (
            <button className="w-full py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700">
              Gửi bài
            </button>
          )}
        </form>
        {feedback && (
          <button
            onClick={() => {
              window.location.href = "/dashboard"; // Chuyển hướng về dashboard
            }}
            className="w-full py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 mt-4"
          >
            Quay lại Dashboard
          </button>
        )}
      </div>
    </div>
  )
}
