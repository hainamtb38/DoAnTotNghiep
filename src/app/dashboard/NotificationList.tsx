"use client";
import { useEffect, useState } from "react";

export default function NotificationList() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const userStr = typeof window !== "undefined" ? localStorage.getItem("user") : null;
    if (!userStr) return;
    const user = JSON.parse(userStr);
    setLoading(true);
    fetch(`/api/notifications?userId=${user.id || user._id}`)
      .then(res => res.json())
      .then(data => {
        setNotifications(data);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Đang tải thông báo...</div>;
  if (!notifications.length) return <div>Không có thông báo nào.</div>;

  return (
    <div className="mt-8">
      <h3 className="text-lg font-bold mb-2">Thông báo/Feedback</h3>
      <ul className="space-y-2">
        {notifications.map((n, idx) => (
          <li key={n._id || idx} className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded">
            <div className="text-sm text-gray-700">{n.message}</div>
            <div className="text-xs text-gray-500 mt-1">Từ: {n.from} | {new Date(n.createdAt).toLocaleString()}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
