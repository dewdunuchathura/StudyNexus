import mongoose from 'mongoose';

const voiceMessageSchema = new mongoose.Schema({
  groupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'creategroup',
    required: true
  },
  messageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  
  // Sender information
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
  
  // Audio file information
  audioUrl: {
    type: String,
    required: true
  },
  audioFilePath: {
    type: String,
    required: true
  },
  fileName: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  mimeType: {
    type: String,
    default: 'audio/webm'
  },
  
  // Audio properties
  duration: {
    type: String,
    required: true
  },
  durationInSeconds: {
    type: Number
  },
  
  // Recording information
  recordedAt: {
    type: Date,
    default: Date.now
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  },
  
  // Audio processing
  isProcessed: {
    type: Boolean,
    default: false
  },
  processedAt: Date,
  
  // Waveform data for visualization
  waveform: [{
    time: Number,
    amplitude: Number
  }],
  
  // Transcription (optional)
  transcript: String,
  isTranscribed: {
    type: Boolean,
    default: false
  },
  transcribedAt: Date,
  
  // Playback tracking
  playCount: {
    type: Number,
    default: 0
  },
  lastPlayedAt: Date,
  
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
voiceMessageSchema.index({ groupId: 1, uploadedAt: -1 });
voiceMessageSchema.index({ senderId: 1, uploadedAt: -1 });

const VoiceMessage = mongoose.model('VoiceMessage', voiceMessageSchema);

export default VoiceMessage;
