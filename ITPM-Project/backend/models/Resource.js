const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['Computer Science', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Engineering']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  author: {
    type: String,
    required: [true, 'Author is required'],
    trim: true
  },
  authorEmail: {
    type: String,
    required: [true, 'Author email is required'],
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  fileName: {
    type: String,
    required: false
  },
  fileSize: {
    type: String,
    required: false
  },
  filePath: {
    type: String,
    required: false
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'reported'],
    default: 'pending'
  },
  views: {
    type: Number,
    default: 0
  },
  downloads: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  },
  comments: [{
    id: {
      type: String,
      required: true
    },
    author: {
      type: String,
      required: true
    },
    text: {
      type: String,
      required: true,
      maxlength: [200, 'Comment cannot exceed 200 characters']
    },
    date: {
      type: Date,
      default: Date.now
    }
  }],
  reports: [{
    id: {
      type: String,
      required: true
    },
    reporter: {
      type: String,
      required: true
    },
    reason: {
      type: String,
      required: true,
      enum: ['Inappropriate content', 'Misleading information', 'Copyright violation', 'Other']
    },
    description: {
      type: String,
      required: true,
      maxlength: [300, 'Report description cannot exceed 300 characters']
    },
    date: {
      type: Date,
      default: Date.now
    }
  }],
  uploadDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for better performance
resourceSchema.index({ title: 'text', description: 'text', author: 'text' });
resourceSchema.index({ category: 1 });
resourceSchema.index({ status: 1 });
resourceSchema.index({ uploadDate: -1 });

module.exports = mongoose.model('Resource', resourceSchema);
