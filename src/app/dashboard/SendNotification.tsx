"use client";
import { useState } from "react";

export default function SendNotification() {
  const [userId, setUserId] = useState("");
  const [message, setMessage] = useState("");
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFeedback("");
    const res = await fetch("/api/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, message, from: "teacher" })
    });
    if (res.ok) {
      setFeedback("Gửi thông báo thành công!");
      setMessage("");
    } else {
      setFeedback("Có lỗi khi gửi thông báo.");
    }
    setLoading(false);
  };

  return (
    <div className="my-8 p-4 bg-yellow-50 rounded-xl shadow">
      <h3 className="font-bold mb-2">Gửi thông báo/feedback cho học viên</h3>
      <form onSubmit={handleSend} className="flex flex-col md:flex-row md:items-center gap-2">
        <input
          className="border rounded px-2 py-1 flex-1"
          placeholder="User ID học viên"
          value={userId}
          onChange={e => setUserId(e.target.value)}
          required
        />
        <input
          className="border rounded px-2 py-1 flex-1"
          placeholder="Nội dung thông báo/feedback"
          value={message}
          onChange={e => setMessage(e.target.value)}
          required
        />
        <button
          className="px-4 py-1 bg-blue-600 text-white rounded"
          disabled={loading}
        >
          {loading ? "Đang gửi..." : "Gửi"}
        </button>
      </form>
      {feedback && <div className="mt-2 text-green-700">{feedback}</div>}
    </div>
  );
}
