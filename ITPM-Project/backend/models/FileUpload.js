import mongoose from 'mongoose';

const fileUploadSchema = new mongoose.Schema({
  groupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'creategroup',
    required: true
  },
  messageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  
  // File information
  fileName: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  fileType: {
    type: String,
    enum: ['image', 'video', 'audio', 'document'],
    required: true
  },
  mimeType: {
    type: String,
    required: true
  },
  
  // File paths
  filePath: {
    type: String,
    required: true
  },
  fileUrl: {
    type: String,
    required: true
  },
  
  // Upload information
  uploadedBy: {
    type: String,
    required: true
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  },
  
  // File processing status
  isProcessed: {
    type: Boolean,
    default: false
  },
  processedAt: Date,
  
  // Thumbnail for images/videos
  thumbnailUrl: String,
  
  // Download tracking
  downloadCount: {
    type: Number,
    default: 0
  },
  lastDownloadedAt: Date,
  
  // File access control
  isPublic: {
    type: Boolean,
    default: true
  },
  allowedUsers: [String],
  
  // File metadata
  dimensions: {
    width: Number,
    height: Number
  },
  duration: String, // For audio/video files
  
  // Status
  isActive: {
    type: Boolean,
    default: true
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: Date
}, {
  timestamps: true
});

// Indexes for better performance
fileUploadSchema.index({ groupId: 1, uploadedAt: -1 });
fileUploadSchema.index({ uploadedBy: 1, uploadedAt: -1 });
fileUploadSchema.index({ fileType: 1, uploadedAt: -1 });

const FileUpload = mongoose.model('FileUpload', fileUploadSchema);

export default FileUpload;
