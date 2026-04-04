import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import groupRoutes from "./routes/groupRoutes.js";
import groupRequestRoutes from "./routes/groupRequestRoutes.js";
import chatRoutes from "./routes/chat.js";
import errorHandler from "./middleware/errorHandler.js";

dotenv.config();
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/groups', groupRoutes);
app.use('/api/group-requests', groupRequestRoutes);
app.use('/api/chat', chatRoutes);

// Health check
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "StudySpace API is running...",
    version: "1.0.0",
    endpoints: {
      groups: "/api/groups",
      requests: "/api/group-requests"
    }
  });
});

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));