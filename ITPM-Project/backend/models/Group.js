import mongoose from 'mongoose';

const groupSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['project', 'study', 'discussion'],
    required: true
  },
  memberLimit: {
    type: Number,
    min: 4,
    max: 8
  },
  members: {
    type: Number,
    default: 1
  },
  online: {
    type: Number,
    default: 1
  },
  membersVisible: {
    type: Boolean,
    default: true
  },
  leader: {
    type: String,
    default: 'You'
  },
  leaderAv: {
    type: String,
    default: 'JD'
  },
  leaderColor: {
    type: String,
    default: '#1E90FF'
  },
  lastMsg: {
    type: String,
    default: ''
  },
  time: {
    type: String,
    default: ''
  },
  unread: {
    type: Number,
    default: 0
  },
  // New fields for member management
  memberRequests: [{
    userId: String,
    userName: String,
    userEmail: String,
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending'
    },
    requestedAt: {
      type: Date,
      default: Date.now
    },
    reviewedAt: Date,
    reviewedBy: String,
    message: String
  }],
  // Enhanced message system - references to Message model
  messages: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  }],
  
  // Enhanced file system - references to FileUpload model
  sharedFiles: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FileUpload'
  }],
  
  // Voice messages - references to VoiceMessage model
  voiceMessages: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'VoiceMessage'
  }],
  
  // Group chat settings
  chatSettings: {
    allowFileSharing: {
      type: Boolean,
      default: true
    },
    allowVoiceMessages: {
      type: Boolean,
      default: true
    },
    allowImageSharing: {
      type: Boolean,
      default: true
    },
    allowVideoSharing: {
      type: Boolean,
      default: true
    },
    maxFileSize: {
      type: Number,
      default: 50 * 1024 * 1024 // 50MB
    },
    allowedFileTypes: [{
      type: String,
      enum: ['image', 'video', 'audio', 'document']
    }]
  },
  panelMembers: [{
    av: String,
    color: String,
    name: String,
    id: String,
    online: Boolean,
    role: String,
    status: {
      type: String,
      enum: ['active', 'inactive', 'pending'],
      default: 'active'
    }
  }]
}, {
  timestamps: true
});

const Group = mongoose.model('creategroup', groupSchema);

export default Group;
