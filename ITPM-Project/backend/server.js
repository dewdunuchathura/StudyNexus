const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

dotenv.config();

// ── Import routes ─────────────────────────────────────
const authRoutes      = require("./routes/authRoutes");
const userRoutes      = require("./routes/userRoutes");
const testRoutes      = require("./routes/testRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const goalRoutes      = require("./routes/goalRoutes");

const app = express();
const port = process.env.PORT || 5000;

// ── Middleware ─────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ── Routes ─────────────────────────────────────────────
app.use("/api/auth",   authRoutes);
app.use("/user",       userRoutes);
app.use("/api",        testRoutes);
app.use("/api",        dashboardRoutes);
app.use("/api/goals",  goalRoutes);

// ── Health check ───────────────────────────────────────
app.get("/api/health", (_req, res) => {
  res.json({ ok: true, message: "Backend is running" });
});

// ── Start server ───────────────────────────────────────
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

// ── Connect to MongoDB ─────────────────────────────────
connectDB().catch((error) => {
  console.error("MongoDB connection failed:", error.message);
});
