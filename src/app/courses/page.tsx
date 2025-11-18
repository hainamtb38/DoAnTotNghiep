import connectToDatabase from "@/lib/mongodb";

export const dynamic = "force-dynamic";

export default async function CoursesPage() {
  const db = (await connectToDatabase()).connection.useDb("my-ai-grader");
  const courses = await db.collection("Course").find({}).toArray();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Danh sách khóa học</h1>
      <ul className="space-y-4">
        {courses.map((course: any) => (
          <li key={course._id} className="p-4 bg-white rounded-xl shadow">
            {course.title}
          </li>
        ))}
      </ul>
    </div>
  );
}
