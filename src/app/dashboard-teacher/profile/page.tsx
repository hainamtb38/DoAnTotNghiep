"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Teacher {
  id: string;
  name: string;
  email: string;
  username: string;
}

export default function TeacherProfilePage() {
  const router = useRouter();
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const user = localStorage.getItem("user");
    const userId = localStorage.getItem("userId");

    if (user && userId) {
      setTeacher(JSON.parse(user));
    } else {
      setMessage("Không tìm thấy thông tin giáo viên. Vui lòng đăng nhập lại.");
      router.push("/login-teacher");
    }
  }, [router]);

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      setMessage("Mật khẩu mới và xác nhận mật khẩu không khớp.");
      return;
    }

    try {
      const response = await fetch("/api/profile/password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          userId: teacher?.id,
          oldPassword,
          newPassword,
        }),
      });

      if (response.ok) {
        setMessage("Đổi mật khẩu thành công.");
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        const errorData = await response.json();
        setMessage(errorData.error || "Đổi mật khẩu thất bại.");
      }
    } catch (error) {
      console.error("Error changing password:", error);
      setMessage("Có lỗi xảy ra. Vui lòng thử lại.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-4xl bg-white p-8 rounded shadow-md">
        <h1 className="text-3xl font-bold mb-6 text-center">Thông tin cá nhân</h1>

        {message && <p className="text-red-500 mb-4 text-center">{message}</p>}

        {teacher ? (
          <div>
            <p className="text-lg mb-4">
              <strong>Email:</strong> {teacher.email}
            </p>
            <p className="text-lg mb-4">
              <strong>Tên đăng nhập:</strong> {teacher.username}
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">Đổi mật khẩu</h2>
            <div className="mb-4">
              <label className="block text-lg font-medium mb-2">Mật khẩu cũ</label>
              <input
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:ring-blue-300"
              />
            </div>
            <div className="mb-4">
              <label className="block text-lg font-medium mb-2">Mật khẩu mới</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:ring-blue-300"
              />
            </div>
            <div className="mb-4">
              <label className="block text-lg font-medium mb-2">Xác nhận mật khẩu mới</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:ring-blue-300"
              />
            </div>
            {message && <p className="text-red-500 mb-4">{message}</p>}
            <button
              onClick={handleChangePassword}
              className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 focus:outline-none focus:ring focus:ring-green-300"
            >
              Đổi mật khẩu
            </button>
          </div>
        ) : (
          <p className="text-lg text-gray-500">Đang tải thông tin...</p>
        )}

        <button
          onClick={() => router.push("/dashboard-teacher")}
          className="mt-6 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-300"
        >
          Quay lại Dashboard
        </button>
      </div>
    </div>
  );
}