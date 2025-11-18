import { MongoClient } from "mongodb";
import bcrypt from "bcryptjs";

const uri = 'mongodb+srv://hainam:nam123@cluster0.2bmsmkq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const client = new MongoClient(uri);

async function main() {
  await client.connect();
  const db = client.db("my-ai-grader");
  const password = await bcrypt.hash("123456", 10);

  // Nếu chưa có admin thì tạo mới
  const existing = await db.collection("User").findOne({ email: "admin@example.com" });
  if (!existing) {
    const admin = await db.collection("User").insertOne({
      username: "Admin",
      email: "admin@example.com",
      password: password,
      role: "admin",
      createdAt: new Date(),
    });
    console.log("Seeded admin account:", admin);
  } else {
    console.log("Admin account already exists");
  }
  await client.close();
}

main().catch(console.error);
