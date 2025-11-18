import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || "";

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable inside .env.local");
}

async function connectToDatabase() {
  const connection = await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB');
  return connection;
}

export async function getDb(databaseName: string) {
  const connection = await connectToDatabase();
  return connection.connection.useDb(databaseName);
}

export async function getMongoClient() {
  const connection = await connectToDatabase();
  return connection.connection.getClient();
}

export default connectToDatabase;
