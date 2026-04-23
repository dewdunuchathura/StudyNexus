import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import Message from '../models/Message.js';
import FileUpload from '../models/FileUpload.js';
import VoiceMessage from '../models/VoiceMessage.js';
import Group from '../models/Group.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'video/mp4', 'video/avi', 'video/mov', 'video/wmv',
      'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/webm',
      'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'), false);
    }
  }
});

// Get messages for a group
router.get('/groups/:groupId/messages', async (req, res) => {
  try {
    const { groupId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    
    const messages = await Message.find({ groupId })
      .populate('replyTo')
      .sort({ sentAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Message.countDocuments({ groupId });
    
    res.json({
      success: true,
      data: messages,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch messages',
      error: error.message
    });
  }
});

// Send text message
router.post('/groups/:groupId/messages/text', async (req, res) => {
  try {
    const { groupId } = req.params;
    const { text, senderId, senderName, senderAvatar, senderColor, replyTo } = req.body;
    
    // Verify group exists and user is member
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }
    
    const message = new Message({
      groupId,
      senderId,
      senderName,
      senderAvatar,
      senderColor,
      messageType: 'text',
      text: text.trim(),
      replyTo
    });
    
    await message.save();
    
    // Update group's last message
    group.lastMsg = `${senderName}: ${text}`;
    group.time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    await group.save();
    
    const populatedMessage = await Message.findById(message._id).populate('replyTo');
    
    res.status(201).json({
      success: true,
      data: populatedMessage
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to send message',
      error: error.message
    });
  }
});

// Upload file message
router.post('/groups/:groupId/messages/file', upload.single('file'), async (req, res) => {
  try {
    const { groupId } = req.params;
    const { senderId, senderName, senderAvatar, senderColor } = req.body;
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }
    
    // Verify group exists
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }
    
    // Determine file type
    let fileType = 'document';
    if (req.file.mimetype.startsWith('image/')) fileType = 'image';
    else if (req.file.mimetype.startsWith('video/')) fileType = 'video';
    else if (req.file.mimetype.startsWith('audio/')) fileType = 'audio';
    
    // Create file upload record
    const fileUpload = new FileUpload({
      groupId,
      fileName: req.file.filename,
      originalName: req.file.originalname,
      fileSize: req.file.size,
      fileType,
      mimeType: req.file.mimetype,
      filePath: req.file.path,
      fileUrl: `/uploads/${req.file.filename}`,
      uploadedBy: senderId
    });
    
    await fileUpload.save();
    
    // Create message
    const message = new Message({
      groupId,
      senderId,
      senderName,
      senderAvatar,
      senderColor,
      messageType: fileType,
      fileUrl: fileUpload.fileUrl,
      fileName: req.file.originalname,
      fileSize: req.file.size,
      fileType: fileType,
      mimeType: req.file.mimetype
    });
    
    await message.save();
    
    // Update group's last message
    group.lastMsg = `${senderName}: Shared ${fileType}`;
    group.time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    await group.save();
    
    res.status(201).json({
      success: true,
      data: message
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to upload file',
      error: error.message
    });
  }
});

// Upload voice message
router.post('/groups/:groupId/messages/voice', upload.single('audio'), async (req, res) => {
  try {
    const { groupId } = req.params;
    const { senderId, senderName, senderAvatar, senderColor, duration } = req.body;
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No audio file uploaded'
      });
    }
    
    // Verify group exists
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }
    
    // Create voice message record
    const voiceMessage = new VoiceMessage({
      groupId,
      messageId: null, // Will be set when message is created
      senderId,
      senderName,
      senderAvatar,
      senderColor,
      audioUrl: `/uploads/${req.file.filename}`,
      audioFilePath: req.file.path,
      fileName: req.file.filename,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      duration,
      durationInSeconds: parseDuration(duration)
    });
    
    await voiceMessage.save();
    
    // Create message
    const message = new Message({
      groupId,
      senderId,
      senderName,
      senderAvatar,
      senderColor,
      messageType: 'audio',
      fileUrl: voiceMessage.audioUrl,
      fileName: `Voice message (${duration})`,
      fileSize: req.file.size,
      fileType: 'audio',
      mimeType: req.file.mimetype,
      duration
    });
    
    await message.save();
    
    // Link voice message to message
    voiceMessage.messageId = message._id;
    await voiceMessage.save();
    
    // Update group's last message
    group.lastMsg = `${senderName}: Voice message`;
    group.time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    await group.save();
    
    res.status(201).json({
      success: true,
      data: message
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to upload voice message',
      error: error.message
    });
  }
});

// Delete message
router.delete('/messages/:messageId', async (req, res) => {
  try {
    const { messageId } = req.params;
    const { userId } = req.body;
    
    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }
    
    // Check if user is sender
    if (message.senderId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this message'
      });
    }
    
    message.isDeleted = true;
    message.deletedAt = new Date();
    await message.save();
    
    res.json({
      success: true,
      message: 'Message deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete message',
      error: error.message
    });
  }
});

// Helper function to parse duration string
function parseDuration(duration) {
  const parts = duration.split(':');
  return parseInt(parts[0]) * 60 + parseInt(parts[1]);
}

export default router;
