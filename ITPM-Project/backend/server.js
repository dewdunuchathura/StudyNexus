const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

dotenv.config();

// ── Import routes ─────────────────────────────────────
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const groupRoutes = require("./routes/groupRoutes");
const groupRequestRoutes = require("./routes/groupRequestRoutes");
const chatRoutes = require("./routes/chat");

const app = express();
const port = process.env.PORT || 5000;

// ── Middleware ─────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ── Routes ─────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/group-requests', groupRequestRoutes);
app.use('/api/chat', chatRoutes);

// ── Health check ───────────────────────────────────────
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

app.get("/api/health", (req, res) => {
  res.json({ ok: true, message: "Backend is running" });
});

// ── Error handling ─────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: "Something went wrong!",
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// ── Start server ───────────────────────────────────────
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

// ── Connect to MongoDB ─────────────────────────────────
connectDB().catch((error) => {
  console.error("MongoDB connection failed:", error.message);
});