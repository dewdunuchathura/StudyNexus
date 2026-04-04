const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const dotenv = require("dotenv");
// Import routes
const resourceRoutes = require('./routes/resourceRoutes');

const connectDB = require("./config/db");
const lectureSummaryRoutes = require("./routes/lectureSummaryRoutes");
import groupRoutes from "./routes/groupRoutes.js";
import groupRequestRoutes from "./routes/groupRequestRoutes.js";
import chatRoutes from "./routes/chat.js";
import errorHandler from "./middleware/errorHandler.js";
dotenv.config({ path: path.join(__dirname, ".env") });

const app = express();
const port = process.env.PORT || 5003;

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: function (req, file, cb) {
    // Accept PDF files only
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Middleware
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

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


// Serve static files from uploads directory
app.use('/uploads', express.static('uploads'));

// Make upload middleware available to routes
app.use((req, res, next) => {
  req.upload = upload;
  next();
});

// Routes
app.use('/api/resources', resourceRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Backend is running',
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/api/lecture-summary", lectureSummaryRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);

  if (err?.name === "MulterError") {
    return res.status(400).json({ ok: false, message: err.message });
  }

  if (/Only PDF and PPTX files are supported/i.test(err.message || "")) {
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

