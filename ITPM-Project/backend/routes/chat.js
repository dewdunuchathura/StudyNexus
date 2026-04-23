const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const ChatMessage = require('../models/ChatMessage');
const Group = require('../models/Group');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadDir = 'uploads/';
    
    // Create subdirectories based on file type
    if (file.mimetype.startsWith('image/')) {
      uploadDir += 'images/';
    } else if (file.mimetype.startsWith('video/')) {
      uploadDir += 'videos/';
    } else if (file.mimetype.startsWith('audio/')) {
      uploadDir += 'audio/';
    } else {
      uploadDir += 'documents/';
    }
    
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

// GET messages for a group
router.get('/groups/:groupId/messages', async (req, res) => {
  try {
    const { groupId } = req.params;
    const { page = 1, limit = 50, before } = req.query;
    
    let query = { groupId, isDeleted: false };
    
    // Pagination with cursor
    if (before) {
      query.createdAt = { $lt: new Date(before) };
    }
    
    const messages = await ChatMessage.find(query)
      .populate('replyTo')
      .populate('readBy.userId')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await ChatMessage.countDocuments({ groupId, isDeleted: false });
    
    res.json({
      success: true,
      data: messages,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
        hasMore: messages.length === limit
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

// POST send text message
router.post('/groups/:groupId/messages', async (req, res) => {
  try {
    const { groupId } = req.params;
    const { content, senderId, senderName, senderAvatar, senderColor, replyTo } = req.body;
    
    // Verify group exists and user is member
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }
    
    const message = new ChatMessage({
      groupId,
      senderId,
      senderName,
      senderAvatar: senderAvatar || '',
      senderColor: senderColor || '#38BDF8',
      messageType: 'text',
      content: content.trim(),
      replyTo
    });
    
    await message.save();
    
    // Update group's last message
    group.lastMsg = `${senderName}: ${content}`;
    group.time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    await group.save();
    
    const populatedMessage = await ChatMessage.findById(message._id)
      .populate('replyTo')
      .populate('readBy.userId');
    
    // Emit real-time message via Socket.IO (if implemented)
    req.app.get('io')?.to(groupId).emit('newMessage', populatedMessage);
    
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

// POST upload file message
router.post('/groups/:groupId/upload', upload.single('file'), async (req, res) => {
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
    let messageType = 'file';
    if (req.file.mimetype.startsWith('image/')) {
      messageType = 'image';
    } else if (req.file.mimetype.startsWith('video/')) {
      messageType = 'video';
    } else if (req.file.mimetype.startsWith('audio/')) {
      messageType = 'audio';
    }
    
    // Get relative file path
    const relativePath = req.file.path.replace(/^.*uploads\//, '');
    const fileUrl = `/uploads/${relativePath}`;
    
    const message = new ChatMessage({
      groupId,
      senderId,
      senderName,
      senderAvatar: senderAvatar || '',
      senderColor: senderColor || '#38BDF8',
      messageType,
      fileUrl,
      fileName: req.file.originalname,
      fileSize: req.file.size,
      mimeType: req.file.mimetype
    });
    
    await message.save();
    
    // Update group's last message
    group.lastMsg = `${senderName}: Shared ${messageType}`;
    group.time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    await group.save();
    
    const populatedMessage = await ChatMessage.findById(message._id)
      .populate('replyTo')
      .populate('readBy.userId');
    
    // Emit real-time message
    req.app.get('io')?.to(groupId).emit('newMessage', populatedMessage);
    
    res.status(201).json({
      success: true,
      data: populatedMessage
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to upload file',
      error: error.message
    });
  }
});

// POST voice message
router.post('/groups/:groupId/voice', upload.single('audio'), async (req, res) => {
  try {
    const { groupId } = req.params;
    const { senderId, senderName, senderAvatar, senderColor, duration } = req.body;
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No audio file uploaded'
      });
    }
    
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }
    
    const relativePath = req.file.path.replace(/^.*uploads\//, '');
    const audioUrl = `/uploads/${relativePath}`;
    
    // Generate simple waveform data
    const waveform = Array.from({ length: 20 }, (_, i) => ({
      time: i * 0.1,
      amplitude: Math.random() * 100
    }));
    
    const message = new ChatMessage({
      groupId,
      senderId,
      senderName,
      senderAvatar: senderAvatar || '',
      senderColor: senderColor || '#38BDF8',
      messageType: 'audio',
      fileUrl: audioUrl,
      fileName: `Voice message (${duration})`,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      duration,
      waveform
    });
    
    await message.save();
    
    // Update group's last message
    group.lastMsg = `${senderName}: Voice message`;
    group.time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    await group.save();
    
    const populatedMessage = await ChatMessage.findById(message._id)
      .populate('replyTo')
      .populate('readBy.userId');
    
    // Emit real-time message
    req.app.get('io')?.to(groupId).emit('newMessage', populatedMessage);
    
    res.status(201).json({
      success: true,
      data: populatedMessage
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to upload voice message',
      error: error.message
    });
  }
});

// PUT mark messages as read
router.put('/messages/:messageId/read', async (req, res) => {
  try {
    const { messageId } = req.params;
    const { userId } = req.body;
    
    const message = await ChatMessage.findById(messageId);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }
    
    // Add to readBy array if not already read
    const alreadyRead = message.readBy.some(read => read.userId === userId);
    if (!alreadyRead) {
      message.readBy.push({ userId, readAt: new Date() });
      message.status = 'read';
      await message.save();
    }
    
    res.json({
      success: true,
      message: 'Message marked as read'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to mark message as read',
      error: error.message
    });
  }
});

// POST add reaction
router.post('/messages/:messageId/reactions', async (req, res) => {
  try {
    const { messageId } = req.params;
    const { userId, emoji } = req.body;
    
    const message = await ChatMessage.findById(messageId);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }
    
    // Remove existing reaction by this user
    message.reactions = message.reactions.filter(r => r.userId !== userId);
    
    // Add new reaction
    message.reactions.push({ userId, emoji, addedAt: new Date() });
    await message.save();
    
    // Emit real-time reaction
    req.app.get('io')?.to(message.groupId.toString()).emit('newReaction', {
      messageId,
      userId,
      emoji
    });
    
    res.status(201).json({
      success: true,
      data: { messageId, userId, emoji }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to add reaction',
      error: error.message
    });
  }
});

// DELETE message
router.delete('/messages/:messageId', async (req, res) => {
  try {
    const { messageId } = req.params;
    const { userId } = req.body;
    
    const message = await ChatMessage.findById(messageId);
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
    
    // Emit real-time deletion
    req.app.get('io')?.to(message.groupId.toString()).emit('messageDeleted', {
      messageId,
      userId
    });
    
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

module.exports = router;
