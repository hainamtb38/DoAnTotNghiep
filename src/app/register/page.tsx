"use client";
import { useState } from "react";
import Link from "next/link";

export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password }),
    });
    const data = await res.json();
    if (res.ok) {
      setMessage("Đăng ký thành công!");
    } else {
      setMessage(data.error || "Đăng ký thất bại");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg">
        <h2 className="text-2xl font-bold text-center mb-6">Đăng ký</h2>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Họ và tên"
            className="w-full p-3 border rounded-xl"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="Email"
            className="w-full p-3 border rounded-xl"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Mật khẩu"
            className="w-full p-3 border rounded-xl"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          <button className="w-full py-3 bg-green-600 text-white rounded-xl hover:bg-green-700">
            Tạo tài khoản
          </button>
        </form>
        {message && (
          <div className="mt-4 text-center text-sm text-red-600">{message}</div>
        )}
        <div className="mt-4 text-center">
          <Link href="/register-teacher">
            <button className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-300">
              Tạo tài khoản cho giáo viên
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
