const { MongoClient } = require("mongodb");

const uri = "mongodb+srv://hainam:nam123@cluster0.2bmsmkq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const client = new MongoClient(uri);

async function migrateSubmissions() {
  try {
    await client.connect();

    const sourceDb = client.db("test");
    const targetDb = client.db("my-ai-grader");

    const submissions = await sourceDb.collection("submissions").find().toArray();

    if (submissions.length === 0) {
      console.log("No submissions found in the source database.");
      return;
    }

    const result = await targetDb.collection("submissions").insertMany(submissions);

    console.log(`Migrated ${result.insertedCount} submissions to the target database.`);

    // Optionally, delete the original submissions from the source database
    // await sourceDb.collection("submissions").deleteMany({});

  } catch (error) {
    console.error("Error during migration:", error);
  } finally {
    await client.close();
  }
}

migrateSubmissions();