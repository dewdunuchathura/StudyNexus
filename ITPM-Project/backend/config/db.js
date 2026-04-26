const mongoose = require("mongoose");

async function connectDB() {
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB_NAME || "itpmDB";

  if (!uri) {
    throw new Error("MONGODB_URI is not set");
  }

  mongoose.set("strictQuery", true);
  await mongoose.connect(uri, { dbName });
  console.log(`MongoDB connected to ${mongoose.connection.name}`);
}

module.exports = connectDB;
