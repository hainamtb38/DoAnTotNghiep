"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Logout() {
  const router = useRouter();

  useEffect(() => {
    // Xóa tất cả thông tin người dùng khỏi localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("user");
    console.log("User logged out, redirecting to login page...");

    // Chuyển hướng về trang đăng nhập
    router.push("/login");
  }, [router]);

  return null; // Không cần hiển thị gì trên trang đăng xuất
}