import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  groupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'creategroup',
    required: true
  },
  senderId: {
    type: String,
    required: true
  },
  senderName: {
    type: String,
    required: true
  },
  senderAvatar: {
    type: String,
    required: true
  },
  senderColor: {
    type: String,
    required: true
  },
  
  // Message type
  messageType: {
    type: String,
    enum: ['text', 'image', 'video', 'audio', 'document'],
    required: true
  },
  
  // Text message content
  text: {
    type: String,
    trim: true
  },
  
  // File information (for images, videos, audio, documents)
  fileUrl: {
    type: String
  },
  fileName: {
    type: String
  },
  fileSize: {
    type: Number
  },
  fileType: {
    type: String
  },
  mimeType: {
    type: String
  },
  
  // Audio specific fields
  duration: {
    type: String
  },
  
  // Message status
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date
  },
  
  // Timestamps
  sentAt: {
    type: Date,
    default: Date.now
  },
  
  // Reply information
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  
  // Reactions
  reactions: [{
    userId: String,
    emoji: String,
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Edit/Delete functionality
  isEdited: {
    type: Boolean,
    default: false
  },
  editedAt: Date,
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: Date
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for formatted time
messageSchema.virtual('formattedTime').get(function() {
  return this.sentAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
});

// Indexes for better performance
messageSchema.index({ groupId: 1, sentAt: -1 });
messageSchema.index({ senderId: 1, groupId: 1 });

const Message = mongoose.model('Message', messageSchema);

export default Message;
