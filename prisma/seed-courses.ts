import { MongoClient } from "mongodb";

const uri = 'mongodb+srv://hainam:nam123@cluster0.2bmsmkq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const client = new MongoClient(uri);

async function main() {
  await client.connect();
  const db = client.db("my-ai-grader");

  const courses = [
    { title: "Lập trình React", description: "Khóa học React cơ bản đến nâng cao" },
    { title: "Toán ứng dụng AI", description: "Toán cho học máy và AI" },
    { title: "Python cho AI", description: "Lập trình Python ứng dụng AI" }
  ];

  await db.collection("Course").insertMany(courses);
  console.log("Seeded courses!");
  await client.close();
}

main().catch(console.error);
