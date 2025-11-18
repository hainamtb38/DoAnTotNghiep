"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import SubmissionList from "./SubmissionList";
import NotificationList from "./NotificationList";
import StudyStats from "./StudyStats";
import ScoreHistory from "./ScoreHistory";

interface Submission {
  _id: string; // Add _id to store GridFS file ID
  courseId: string; // Add courseId to identify the course
  createdAt: string; // Add createdAt to store submission time
  course: string;
  session: string;
  fileName: string;
  status?: string; // Added status field
  score?: number;  // Added score field
  feedback?: string; // Added feedback field
}

export default function Dashboard() {
  const courses = [
    { id: 1, name: "Lập trình React", progress: 70 },
    { id: 2, name: "Toán ứng dụng AI", progress: 40 },
    { id: 3, name: "Python cho AI", progress: 40 },
  ];
  const router = useRouter();
  const [selectedCourse, setSelectedCourse] = useState<string>(""); // Default to empty string
  const [sessionNumber, setSessionNumber] = useState("");
  const [submissionHistory, setSubmissionHistory] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true); // Thêm trạng thái loading

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.log("No token found, redirecting to login...");
      router.push("/login"); // Chuyển hướng về trang đăng nhập nếu không có token
    } else {
      setLoading(false); // Xác thực xong, tắt trạng thái loading
    }
  }, []);

  useEffect(() => {
    const fetchSubmissionHistory = async () => {
      try {
        const token = localStorage.getItem("token"); // Lấy token từ localStorage
        if (!token) {
          console.error("No token found. Redirecting to login...");
          router.push("/login"); // Chuyển hướng về trang đăng nhập nếu không có token
          return;
        }

        const response = await fetch("/api/submissions", {
          headers: {
            Authorization: `Bearer ${token}`, // Gửi token trong header
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            console.error("Unauthorized. Redirecting to login...");
            router.push("/login"); // Chuyển hướng nếu không được xác thực
          } else {
            throw new Error(
              `Failed to fetch submission history: ${response.statusText}`
            );
          }
        }

        const data = await response.json();
        // Sort history by createdAt in descending order
        data.sort(
          (a: Submission, b: Submission) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setSubmissionHistory(data);
      } catch (error) {
        console.error("Error fetching submission history:", error);
      }
    };

    fetchSubmissionHistory();
  }, [router]);

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("userId");
      localStorage.removeItem("user");
      console.log("User logged out, redirecting to login page...");
      router.push("/login");
    }
  };

  const handleCourseChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCourse(event.target.value); // Always update state
    localStorage.setItem("selectedCourse", event.target.value);
  };

  const handleSessionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSessionNumber(value);
    localStorage.setItem("sessionNumber", value);
  };

  if (loading) {
    // Hiển thị màn hình chờ trong khi xác thực
    return <div>Đang kiểm tra thông tin đăng nhập...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <StudyStats refreshKey={0} />
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Xin chào, Học viên 👋</h1>
        <div className="flex items-center space-x-2">
          <Link
            href="/profile"
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-xl shadow hover:bg-gray-300"
          >
            Thông tin cá nhân
          </Link>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500 text-white rounded-xl shadow hover:bg-red-600"
          >
            Đăng xuất
          </button>
        </div>
      </div>
      <div className="flex space-x-4 mb-6">
        <Link
          href="/submit"
          className="px-6 py-2 bg-green-600 text-white rounded-xl shadow hover:bg-green-700"
        >
          Nộp bài tập
        </Link>
      </div>
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-4">Các khóa học</h2>
        <select
          value={selectedCourse}
          onChange={handleCourseChange}
          className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:ring-blue-300"
        >
          <option value="">Chọn khóa học</option> {/* Placeholder option */}
          {courses.map((course) => (
            <option key={course.id} value={course.name}>
              {course.name}
            </option>
          ))}
        </select>
      </div>
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-4">Buổi học (bắt buộc chọn)</h2>
        <input
          type="number"
          min="1"
          value={sessionNumber}
          onChange={handleSessionChange}
          className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:ring-blue-300"
          placeholder="Nhập số buổi học"
        />
        <p className="mt-4 text-lg">
          Buổi học thứ: {sessionNumber || "Chưa chọn"}
        </p>
      </div>
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-4">Lịch sử nộp bài</h2>
        {submissionHistory.length > 0 ? (
          submissionHistory.map((submission, index) => (
            <div
              key={index}
              className="mb-4 p-4 border rounded bg-gray-50 grid grid-cols-4 gap-4 items-center"
            >
              <div>
                <p>Khóa học: {submission.courseId}</p>
                <p>Buổi học: {submission.session}</p>
                <p>Thời gian nộp: {new Date(submission.createdAt).toLocaleString()}</p>
                <p>File đã nộp: {submission.fileName}</p>
              </div>
              <div>
                <p>Tình trạng: {submission.status || "Chưa cập nhật"}</p>
               
                <p>Số điểm: {submission.score !== null && submission.score !== undefined ? submission.score : "Chưa chấm"}</p>

                <p>Phản hồi: {submission.feedback || "Chưa có phản hồi"}</p>
              </div>
              <div>
                <p>
                  Tải file:{" "}
                  <a
                    href={`/api/download/${submission._id}`}
                    download={submission.fileName}
                    className="text-blue-600 hover:underline"
                  >
                    Tại đây
                  </a>
                </p>
                {submission.status !== "grading" && (
                  <button
                    onClick={async () => {
                      try {
                        const response = await fetch(`/api/submissions/${submission._id}/grade`, {
                          method: "POST",
                        });
                        if (response.ok) {
                          alert("Bài đã được chấm thành công!");
                          location.reload(); // Tải lại danh sách bài nộp
                        } else {
                          alert("Chấm bài thất bại. Vui lòng thử lại.");
                        }
                      } catch (error) {
                        console.error("Error grading submission:", error);
                        alert("Đã xảy ra lỗi khi chấm bài.");
                      }
                    }}
                    className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Chấm bài
                  </button>
                )}
              </div>
              <div>
                {/* Cột trống hoặc để thêm thông tin khác nếu muốn */}
              </div>
            </div>
          ))
        ) : (
          <p>Không có lịch sử nộp bài.</p>
        )}
      </div>
    </div>
  );
}
