require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const connectDB = require('./config/db');

// ── Import routes ──────────────────────────────────────
const resourceRoutes      = require('./routes/resourceRoutes');
const authRoutes          = require('./routes/authRoutes');
const userRoutes          = require('./routes/userRoutes');
const testRoutes          = require('./routes/testRoutes');
const dashboardRoutes     = require('./routes/dashboardRoutes');
const goalRoutes          = require('./routes/goalRoutes');
const lectureSummaryRoutes = require('./routes/lectureSummaryRoutes');

// Pamuditha's new routes
const groupRoutes         = require('./routes/groupRoutes');
const groupRequestRoutes  = require('./routes/groupRequestRoutes');
const chatRoutes           = require('./routes/chat');

const app = express();
const port = process.env.PORT || 5000;

// ── Multer config (PDF uploads) ────────────────────────
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
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// ── Middleware ─────────────────────────────────────────
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Serve static files from uploads directory
app.use('/uploads', express.static('uploads'));

// Make upload middleware available to routes
app.use((req, res, next) => {
  req.upload = upload;
  next();
});

// ── Routes ─────────────────────────────────────────────
app.use('/api/auth',           authRoutes);
app.use('/api/users',          userRoutes);
app.use('/api/resources',      resourceRoutes);
app.use('/api/lecture-summary', lectureSummaryRoutes);
app.use('/api/goals',          goalRoutes);
app.use('/api',                testRoutes);
app.use('/api',                dashboardRoutes);

// Pamuditha's routes
app.use('/api/groups',         groupRoutes);
app.use('/api/group-requests', groupRequestRoutes);
app.use('/api/chat',           chatRoutes);

// ── Health check ───────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Backend is running',
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// ── Error handling ───────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err);

  if (err?.name === "MulterError") {
    return res.status(400).json({ ok: false, message: err.message });
  }

  if (/Only PDF and PPTX files are supported/i.test(err.message || "")) {
    return res.status(400).json({ ok: false, message: err.message });
  }

  res.status(500).json({ 
    ok: false, 
    message: err.message || "Something went wrong!",
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// ── Connect to MongoDB then start server ───────────────
connectDB()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server running on ${port}`);
    });
  })
  .catch((error) => {
    console.error('MongoDB connection failed:', error.message);
    process.exit(1);
  });

