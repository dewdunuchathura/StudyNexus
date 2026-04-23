const mongoose = require('mongoose');

const groupRequestSchema = new mongoose.Schema({
  groupId: {
    type: String,
    required: true,
    ref: 'Group'
  },
  requesterId: {
    type: String,
    required: true
  },
  requesterName: {
    type: String,
    required: true
  },
  requesterEmail: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending'
  },
  requestedAt: {
    type: Date,
    default: Date.now
  },
  reviewedAt: {
    type: Date
  },
  reviewedBy: {
    type: String
  },
  message: {
    type: String,
    maxlength: 500
  }
}, {
  timestamps: true
});

const GroupRequest = mongoose.model('GroupRequest', groupRequestSchema);

module.exports = GroupRequest;
