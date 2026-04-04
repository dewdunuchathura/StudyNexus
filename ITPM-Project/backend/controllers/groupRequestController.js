import Group from '../models/Group.js';
import GroupRequest from '../models/GroupRequest.js';

// @desc    Request to join a group
// @route   POST /api/groups/:groupId/requests
// @access  Public
export const requestToJoinGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { requesterId, requesterName, requesterEmail, message } = req.body;

    // Check if group exists
    const group = await Group.findOne({ id: groupId });
    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }

    // Check if user already requested
    const existingRequest = await GroupRequest.findOne({
      groupId,
      requesterId,
      status: { $in: ['pending', 'accepted'] }
    });

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: existingRequest.status === 'pending' 
          ? 'Request already pending' 
          : 'Already a member of this group'
      });
    }

    // Create request
    const request = await GroupRequest.create({
      groupId,
      requesterId,
      requesterName,
      requesterEmail,
      message
    });

    // Add to group's member requests
    group.memberRequests.push({
      userId: requesterId,
      userName: requesterName,
      userEmail: requesterEmail,
      status: 'pending',
      message,
      requestedAt: new Date()
    });

    await group.save();

    res.status(201).json({
      success: true,
      message: 'Request sent successfully',
      data: request
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get all pending requests for a group
// @route   GET /api/groups/:groupId/requests
// @access  Public
export const getGroupRequests = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { status } = req.query;

    const filter = { groupId };
    if (status) {
      filter.status = status;
    }

    const requests = await GroupRequest.find(filter).sort({ requestedAt: -1 });

    res.status(200).json({
      success: true,
      count: requests.length,
      data: requests
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Accept a group request
// @route   PUT /api/groups/:groupId/requests/:requestId/accept
// @access  Public
export const acceptGroupRequest = async (req, res) => {
  try {
    const { groupId, requestId } = req.params;
    const { reviewedBy } = req.body;

    const request = await GroupRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Request already processed'
      });
    }

    // Update request status
    request.status = 'accepted';
    request.reviewedAt = new Date();
    request.reviewedBy = reviewedBy;
    await request.save();

    // Update group
    const group = await Group.findOne({ id: groupId });
    if (group) {
      // Update member request status
      const memberRequest = group.memberRequests.find(
        mr => mr.userId === request.requesterId
      );
      if (memberRequest) {
        memberRequest.status = 'accepted';
        memberRequest.reviewedAt = new Date();
        memberRequest.reviewedBy = reviewedBy;
      }

      // Add to panel members
      group.panelMembers.push({
        av: request.requesterName.slice(0, 2).toUpperCase(),
        color: '#' + Math.floor(Math.random()*16777215).toString(16),
        name: request.requesterName,
        id: request.requesterId,
        online: false,
        role: 'member',
        status: 'active'
      });

      // Increment member count
      group.members += 1;

      await group.save();
    }

    res.status(200).json({
      success: true,
      message: 'Request accepted successfully',
      data: request
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Reject a group request
// @route   PUT /api/groups/:groupId/requests/:requestId/reject
// @access  Public
export const rejectGroupRequest = async (req, res) => {
  try {
    const { groupId, requestId } = req.params;
    const { reviewedBy, rejectionReason } = req.body;

    const request = await GroupRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Request already processed'
      });
    }

    // Update request status
    request.status = 'rejected';
    request.reviewedAt = new Date();
    request.reviewedBy = reviewedBy;
    request.message = rejectionReason || request.message;
    await request.save();

    // Update group
    const group = await Group.findOne({ id: groupId });
    if (group) {
      const memberRequest = group.memberRequests.find(
        mr => mr.userId === request.requesterId
      );
      if (memberRequest) {
        memberRequest.status = 'rejected';
        memberRequest.reviewedAt = new Date();
        memberRequest.reviewedBy = reviewedBy;
        memberRequest.message = rejectionReason || memberRequest.message;
      }
      await group.save();
    }

    res.status(200).json({
      success: true,
      message: 'Request rejected successfully',
      data: request
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get user's request history
// @route   GET /api/users/:userId/requests
// @access  Public
export const getUserRequests = async (req, res) => {
  try {
    const { userId } = req.params;
    const requests = await GroupRequest.find({ requesterId: userId })
      .populate('groupId', 'name category')
      .sort({ requestedAt: -1 });

    res.status(200).json({
      success: true,
      count: requests.length,
      data: requests
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};
