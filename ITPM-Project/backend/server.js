const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, message: "Backend is running" });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

connectDB().catch((error) => {
  console.error("MongoDB connection failed:", error.message);
});
