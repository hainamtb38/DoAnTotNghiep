"use client";
import { useState } from "react";

export default function ChangePassword({ userId }: { userId: string }) {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    const res = await fetch("/api/profile/password", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, oldPassword, newPassword }),
    });
    const data = await res.json();
    if (res.ok) {
      setMessage("Đổi mật khẩu thành công!");
      setOldPassword("");
      setNewPassword("");
    } else {
      setMessage(data.error || "Đổi mật khẩu thất bại");
    }
  };

  return (
    <form className="space-y-3" onSubmit={handleChange}>
      <input
        type="password"
        className="w-full p-3 border rounded-xl"
        placeholder="Mật khẩu cũ"
        value={oldPassword}
        onChange={e => setOldPassword(e.target.value)}
        required
      />
      <input
        type="password"
        className="w-full p-3 border rounded-xl"
        placeholder="Mật khẩu mới"
        value={newPassword}
        onChange={e => setNewPassword(e.target.value)}
        required
      />
      <button className="w-full py-2 bg-green-600 text-white rounded-xl hover:bg-green-700">
        Đổi mật khẩu
      </button>
      {message && <div className="text-center text-sm mt-2 text-blue-600">{message}</div>}
    </form>
  );
}
