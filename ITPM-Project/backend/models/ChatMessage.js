import mongoose from 'mongoose';

const chatMessageSchema = new mongoose.Schema({
  groupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'creategroup',
    required: true,
    index: true
  },
  senderId: {
    type: String,
    required: true,
    index: true
  },
  senderName: {
    type: String,
    required: true
  },
  senderAvatar: {
    type: String,
    default: ''
  },
  senderColor: {
    type: String,
    default: '#38BDF8'
  },
  
  // Message type
  messageType: {
    type: String,
    enum: ['text', 'image', 'video', 'file', 'audio'],
    required: true
  },
  
  // Content based on type
  content: {
    type: String,
    required: function() {
      return this.messageType === 'text';
    }
  },
  
  // File information
  fileUrl: {
    type: String
  },
  fileName: {
    type: String
  },
  fileSize: {
    type: Number
  },
  mimeType: {
    type: String
  },
  
  // Audio specific
  duration: {
    type: String
  },
  waveform: [{
    time: Number,
    amplitude: Number
  }],
  
  // Message status
  status: {
    type: String,
    enum: ['sent', 'delivered', 'read'],
    default: 'sent'
  },
  
  // Reply threading
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ChatMessage'
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
  
  // Edit/Delete
  isEdited: {
    type: Boolean,
    default: false
  },
  editedAt: Date,
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: Date,
  
  // Read receipts
  readBy: [{
    userId: String,
    readAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtuals
chatMessageSchema.virtual('formattedTime').get(function() {
  return this.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
});

chatMessageSchema.virtual('isOwnMessage').get(function() {
  // This will be set in frontend based on current user
  return false;
});

// Indexes for performance
chatMessageSchema.index({ groupId: 1, createdAt: -1 });
chatMessageSchema.index({ senderId: 1, groupId: 1 });
chatMessageSchema.index({ messageType: 1, createdAt: -1 });

const ChatMessage = mongoose.model('ChatMessage', chatMessageSchema);

export default ChatMessage;
