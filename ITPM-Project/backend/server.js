require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const connectDB = require('./config/db');

// ── Import routes ──────────────────────────────────────
const resourceRoutes  = require('./routes/resourceRoutes');
const authRoutes      = require('./routes/authRoutes');
const userRoutes      = require('./routes/userRoutes');
const testRoutes      = require('./routes/testRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const goalRoutes      = require('./routes/goalRoutes');

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
app.use(express.json());

// Serve static files from uploads directory
app.use('/uploads', express.static('uploads'));

// Make upload middleware available to routes
app.use((req, res, next) => {
  req.upload = upload;
  next();
});

// ── Routes ─────────────────────────────────────────────
app.use('/api/resources', resourceRoutes);   // Mindula
app.use('/api/auth',      authRoutes);        // Krishan
app.use('/user',          userRoutes);        // Krishan
app.use('/api',           testRoutes);        // Krishan
app.use('/api',           dashboardRoutes);   // Krishan
app.use('/api/goals',     goalRoutes);        // Krishan

// ── Health check ───────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Backend is running',
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
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
