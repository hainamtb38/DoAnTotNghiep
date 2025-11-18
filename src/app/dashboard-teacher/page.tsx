"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Teacher {
  id: string;
  name: string;
  email: string;
}

interface Student {
  id: string;
  username: string;
  email: string;
}

interface Assignment {
  id: string;
  title: string;
  score?: number;
}

interface Submission {
  _id?: string;
  userId: string; // Added userId field
  content: string;
  createdAt: string; // Added createdAt field
  score?: number; // Added score field
  feedback?: string; // Added feedback field
  courseId: string; // Added courseId field
  session?: number; // Added session field
  fileName?: string; // Added fileName field
  userInfo?: {
    username: string; // Added username field from users collection
  }; // Added userInfo field for joined data
}

export default function DashboardTeacherPage() {
  const router = useRouter();
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [newStudent, setNewStudent] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [courses, setCourses] = useState([
    { id: 1, name: "Lập trình React", progress: 70 },
    { id: 2, name: "Toán ứng dụng AI", progress: 40 },
    { id: 3, name: "Python cho AI", progress: 40 },
  ]);
  const [showCourses, setShowCourses] = useState(false);
  const [sessionNumber, setSessionNumber] = useState(1);
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<Submission[]>([]);

  useEffect(() => {
    const checkRole = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login-teacher");
        return;
      }

      const payload = JSON.parse(atob(token.split(".")[1]));
      if (payload.role !== "teacher") {
        router.push("/login-teacher");
      }
    };

    const user = localStorage.getItem("user");
    if (user) {
      setTeacher(JSON.parse(user));
    } else {
      console.error("No teacher data found in localStorage");
    }

    const fetchData = async () => {
      const studentResponse = await fetch("/api/students");
      const studentData = await studentResponse.json();
      setStudents(studentData);

      const assignmentResponse = await fetch("/api/assignments");
      const assignmentData = await assignmentResponse.json();
      setAssignments(assignmentData.assignments);

      const submissionResponse = await fetch("/api/submissions");
      const submissionData = await submissionResponse.json();
      setSubmissions(submissionData);
    };

    checkRole();
    fetchData();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login-teacher");
  };

  const handleAddStudent = async () => {
    const response = await fetch("/api/students/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newStudent),
    });
    const data = await response.json();
    if (!data.error) {
      setStudents((prev) => [...prev, data.user]);
      setNewStudent({ username: "", email: "", password: "" });
    } else {
      alert(data.error);
    }
  };

  const handleDeleteStudent = async (id: string) => {
    const response = await fetch("/api/students/delete", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    const data = await response.json();
    if (!data.error) {
      setStudents((prev) => prev.filter((student) => student.id !== id));
    } else {
      alert(data.error);
    }
  };

  const toggleCourses = () => {
    setShowCourses((prev) => !prev);
  };

  const fetchCourses = async (studentId: string) => {
    const response = await fetch(`/api/courses?studentId=${studentId}`);
    const data = await response.json();
    setCourses(data);
  };

  const handleSessionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value, 10);
    if (!isNaN(value) && value > 0) {
      setSessionNumber(value);
    }
  };

  const handleCourseChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const courseName = event.target.value;
    setSelectedCourse(courseName);
  };

  const handleSearch = async () => {
    if (!selectedCourse || !sessionNumber) {
      alert("Vui lòng chọn khóa học và buổi học.");
      return;
    }

    try {
      const response = await fetch(
        `/api/teacher/submissions?courseId=${selectedCourse}&session=${sessionNumber}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setSearchResults(data);
      } else {
        console.error("Failed to fetch submissions");
      }
    } catch (error) {
      console.error("Error fetching submissions:", error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-6xl bg-white p-12 rounded shadow-md">
        <h1 className="text-4xl font-bold mb-8 text-center">
          Xin chào, Giáo viên 👩‍🏫
        </h1>

        {/* Hiển thị thông tin giáo viên */}
        {teacher && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold">Thông tin giáo viên</h2>
            <p className="text-lg">Email: {teacher.email}</p>
          </div>
        )}

        <div className="flex justify-between mb-8">
          <button className="bg-green-500 text-white py-3 px-6 rounded text-lg hover:bg-green-600 focus:outline-none focus:ring focus:ring-green-300">
            Quản lý bài tập
          </button>
        </div>

        <div className="flex justify-end" style={{ position: "absolute", top: 10, right: 10 }}>
          <button
            onClick={() => router.push("/dashboard-teacher/profile")}
            className="bg-blue-500 text-white py-3 px-6 rounded text-lg hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-300 mr-4"
          >
            Thông tin cá nhân
          </button>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white py-3 px-6 rounded text-lg hover:bg-red-600 focus:outline-none focus:ring focus:ring-red-300"
          >
            Đăng xuất
          </button>
        </div>
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-6">Chọn khóa học</h2>
          <select
            onChange={handleCourseChange}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:ring-blue-300"
          >
            <option value="">Chọn khóa học</option>
            {courses.map((course) => (
              <option key={course.id} value={course.name}>
                {course.name}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-6">Buổi học</h2>
          <input
            type="number"
            min="1"
            value={sessionNumber}
            onChange={handleSessionChange}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:ring-blue-300"
          />
          <p className="mt-4 text-lg">Buổi học thứ: {sessionNumber}</p>
        </div>

        <button
          onClick={handleSearch}
          className="bg-blue-500 text-white py-3 px-6 rounded text-lg hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-300"
        >
          Tìm kiếm
        </button>

        <div className="mt-8">
          <h2 className="text-xl font-bold mb-6">Danh sách học viên đã nộp bài</h2>
          {searchResults.length > 0 ? (
            searchResults.map((submission, index) => (
              <div
                key={index}
                className="mb-4 p-4 border rounded bg-gray-50 shadow-md"
              >
                <div className="flex gap-4">
                  {/* Column 1 */}
                  <div className="flex-1">
                    <p><strong>ID nộp bài:</strong> {submission._id}</p>
                    <p><strong>Khóa học:</strong> {submission.courseId}</p>
                    <p><strong>Học viên:</strong> {submission.userInfo?.username || "N/A"}</p>
                  </div>

                  {/* Column 2 */}
                  <div className="flex-1">
                    <p><strong>Buổi học:</strong> {submission.session}</p>
                    <p><strong>Thời gian nộp:</strong> {new Date(submission.createdAt).toLocaleString()}</p>
                    <p><strong>Tên file:</strong> {submission.fileName}</p>
                    {/* Liên kết tải file */}
                    {submission._id && (
                      <a
                        href={`/api/download/${submission._id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 underline hover:text-blue-700"
                      >
                        Tải file
                      </a>
                    )}
                  </div>

                  {/* Column 3 */}
                  <div className="flex-1">
                    <p><strong>Số điểm:</strong> {submission.score ?? "Chưa chấm"}</p>
                    <p><strong>Phản hồi:</strong> {submission.feedback ?? "Không có phản hồi"}</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p>Không có học viên nào nộp bài.</p>
          )}
        </div>
      </div>
    </div>
  );
}