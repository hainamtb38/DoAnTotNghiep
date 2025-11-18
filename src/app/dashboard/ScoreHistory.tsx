"use client";
import { useEffect, useState } from "react";

export default function ScoreHistory() {
  const [scores, setScores] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const userStr = typeof window !== "undefined" ? localStorage.getItem("user") : null;
    if (!userStr) return;
    const user = JSON.parse(userStr);
    setLoading(true);
    fetch(`/api/score-history?userId=${user.id || user._id}`)
      .then(res => res.json())
      .then(data => {
        setScores(data);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Đang tải lịch sử điểm...</div>;
  if (!scores.length) return <div>Chưa có bài nộp nào có điểm.</div>;

  return (
    <div className="mt-8">
      <h3 className="text-lg font-bold mb-2">Lịch sử điểm số</h3>
      <ul className="space-y-2">
        {scores.map((s, idx) => (
          <li key={s._id || idx} className="bg-gray-100 rounded p-3">
            <div><b>Khoá học:</b> {s.courseId}</div>
            <div><b>Bài nộp:</b> {s.content}</div>
            <div><b>Điểm:</b> {s.score !== undefined ? s.score : "Chưa chấm"}</div>
            <div className="text-xs text-gray-500">Nộp lúc: {new Date(s.submittedAt).toLocaleString()}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
