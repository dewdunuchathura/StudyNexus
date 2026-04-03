const mongoose = require("mongoose");

async function dropLegacyLectureSummaryIndexes() {
  const collection = mongoose.connection.db.collection("lecturesummaries");

  try {
    const indexes = await collection.indexes();
    const hasWorkspaceIndex = indexes.some((index) => index.name === "workspaceId_1");

    if (hasWorkspaceIndex) {
      await collection.dropIndex("workspaceId_1");
      console.log("Dropped legacy lecturesummaries.workspaceId_1 index");
    }
  } catch (error) {
    if (error.codeName === "IndexNotFound" || error.code === 27) {
      return;
    }
    throw error;
  }
}

async function connectDB() {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;

  if (!uri) {
    throw new Error("MONGODB_URI is not set");
  }

  mongoose.set("strictQuery", true);
  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 5000,
  });

  await dropLegacyLectureSummaryIndexes();

  console.log("MongoDB connected");
  return mongoose.connection;
}

module.exports = connectDB;
