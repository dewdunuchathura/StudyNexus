const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, ".env") });

const connectDB = require("./config/db");
const lectureSummaryRoutes = require("./routes/lectureSummaryRoutes");

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/api/lecture-summary", lectureSummaryRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);

  if (err?.name === "MulterError") {
    return res.status(400).json({ ok: false, message: err.message });
  }

  if (/Only PDF files are supported/i.test(err.message || "")) {
    return res.status(400).json({ ok: false, message: err.message });
  }

  res.status(500).json({ ok: false, message: err.message });
});

async function start() {
  await connectDB();
  app.listen(port, () => console.log(`Server running on ${port}`));
}

if (require.main === module) {
  start().catch((error) => {
    console.error("Failed to start server:", error);
    process.exit(1);
  });
}

module.exports = { app, start };
