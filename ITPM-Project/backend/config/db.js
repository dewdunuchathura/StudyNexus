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
    console.warn('MONGO_URI not set - skipping MongoDB connection (running in degraded mode)');
    return;
  }

  try {
    mongoose.set("strictQuery", true);
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });

    await dropLegacyLectureSummaryIndexes();

    console.log("MongoDB connected");
    return mongoose.connection;
  } catch (error) {
    console.error("DB ERROR:", error.message);
    // don't exit the whole app; allow server to run so frontend/pages can be tested
    // process.exit(1);
  }
}

module.exports = connectDB;
