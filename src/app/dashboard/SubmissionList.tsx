"use client";
import { useEffect, useState } from "react";

export default function SubmissionList() {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchSubmissions = () => {
    setLoading(true);
    const userId = localStorage.getItem("userId");
    const url = userId ? `/api/submissions?userId=${userId}` : `/api/submissions`;

    fetch(url)
      .then(res => res.json())
      .then(data => {
        setSubmissions(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Lỗi tải submissions:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      fetchSubmissions();
    }
  }, []);

  if (loading) return <div>Đang tải danh sách bài đã nộp...</div>;
  if (!submissions.length) return <div>Chưa có bài nộp nào.</div>;

  return (
    <div className="mt-8">
      <h3 className="text-lg font-bold mb-2">Bài đã nộp gần đây</h3>
      <ul className="space-y-2">
        {submissions.map((s, idx) => (
          <li key={s._id || idx} className="bg-gray-100 rounded p-3">
            <div><b>Khoá học:</b> {s.courseId}</div>
            <div><b>Tên file:</b> {s.fileName}</div>
            <div className="text-xs text-gray-500">
              Nộp lúc: {new Date(s.createdAt).toLocaleString()}
            </div>
            <div><b>Tình trạng:</b> {s.status || "Chưa cập nhật"}</div>
            <div><b>Số điểm:</b> {s.score !== null ? s.score : "Chưa có điểm"}</div>
            <div><b>Phản hồi:</b> {s.feedback || "Chưa có phản hồi"}</div>
            <div className="mt-2 flex gap-2">
              <a
                href={`/api/submissions?fileId=${s.fileId}`}
                className="px-2 py-1 bg-blue-500 text-white rounded"
                download
              >
                Tải xuống
              </a>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
