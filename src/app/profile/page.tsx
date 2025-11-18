"use client";
import { useEffect, useState } from "react";
import ChangePassword from "./ChangePassword";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    // Lấy user từ localStorage hoặc API (giả lập)
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const u = JSON.parse(userStr);
      setUser(u);
      setUsername(u.username);
      setEmail(u.email);
    }
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    if (!user) return;
    // Gửi API cập nhật thông tin cá nhân
    const res = await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.id || user._id, username, email }),
    });
    const data = await res.json();
    if (res.ok) {
      setMessage("Đã lưu thông tin cá nhân!");
      setUser((prev: any) => ({ ...prev, username, email }));
      localStorage.setItem("user", JSON.stringify({ ...user, username, email }));
    } else {
      setMessage(data.error || "Lưu thông tin thất bại");
    }
  };

  if (!user) return <div className="p-6">Vui lòng đăng nhập để xem thông tin cá nhân.</div>;

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-4">Thông tin cá nhân</h1>
      <form className="space-y-4" onSubmit={handleSave}>
        <div>
          <label className="block mb-1 font-medium">Tên đăng nhập</label>
          <input
            className="w-full p-3 border rounded-xl"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Email</label>
          <input
            className="w-full p-3 border rounded-xl bg-gray-100 text-gray-500"
            value={email}
            readOnly
            type="email"
          />
        </div>
        <button className="w-full py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700">
          Lưu thông tin
        </button>
      </form>
      {message && <div className="mt-4 text-green-600 text-center">{message}</div>}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-2">Đổi mật khẩu</h2>
        <ChangePassword userId={user.id || user._id} />
      </div>
    </div>
  );
}
