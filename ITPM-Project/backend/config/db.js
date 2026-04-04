import mongoose from "mongoose";

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.warn('⚠️  MONGO_URI not set — skipping MongoDB connection (running in degraded mode)');
      return;
    }

    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("❌ DB ERROR:", error.message);
    // don't exit the whole app; allow server to run so frontend/pages can be tested
    // process.exit(1);
  }
};

export default connectDB;

