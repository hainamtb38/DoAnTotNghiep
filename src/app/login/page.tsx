"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setSuccess(false);
    console.log("Submitting login request...");

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    console.log("API response:", data);

    if (res.ok && data.token) {
      setSuccess(true);
      setMessage("Đăng nhập thành công!");
      console.log("Login successful, redirecting to dashboard...");

      // Lưu user vào localStorage để các trang khác sử dụng
      if (typeof window !== "undefined") {
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("token", data.token);
        if (data.user && data.user.studentId) {
          localStorage.setItem("studentId", data.user.studentId);
          console.log("Student ID saved to localStorage:", data.user.studentId);
        }
        if (data.user && data.user.userId) {
          localStorage.setItem("userId", data.user.userId); // Lưu userId vào localStorage
          console.log("User ID saved to localStorage:", data.user.userId);
        }
      }

      setTimeout(() => {
        router.push("/dashboard");
      }, 1000);
    } else {
      setSuccess(false);
      setMessage(data.error || "Đăng nhập thất bại");
      console.log("Login failed:", data.error);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg">
        <h2 className="text-2xl font-bold text-center mb-6">Đăng nhập</h2>
        <form className="space-y-4" onSubmit={handleSubmit}>
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
          <button
            type="submit"
            className="w-full py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
          >
            Đăng nhập
          </button>
        </form>
        {message && (
          <div className={`mt-4 text-center text-sm ${success ? "text-green-600" : "text-red-600"}`}>{message}</div>
        )}
        <div className="mt-4 text-center">
          <Link href="/login-teacher">
            <button className="w-full bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 focus:outline-none focus:ring focus:ring-green-300">
              Đăng nhập cho giáo viên
            </button>
          </Link>
        </div>
        {/* <div className="mt-4 text-center">
          <button
            onClick={() => {
              localStorage.removeItem("token");
              localStorage.removeItem("userId");
              localStorage.removeItem("user");
              console.log("User logged out, redirecting to login page...");
              router.push("/login");
            }}
            className="w-full bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 focus:outline-none focus:ring focus:ring-red-300"
          >
            Đăng xuất 
          </button>
        </div> */}
      </div>
    </div>
  );
}
