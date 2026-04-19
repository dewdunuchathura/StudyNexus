const Group = require('../models/Group');

// @desc    Get all groups
// @route   GET /api/groups
// @access  Public
const getGroups = async (req, res) => {
  try {
    const groups = await Group.find({});
    res.status(200).json({
      success: true,
      count: groups.length,
      data: groups
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get single group by ID
// @route   GET /api/groups/:id
// @access  Public
const getGroupById = async (req, res) => {
  try {
    const group = await Group.findOne({ id: req.params.id });
    
    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: group
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Create new group
// @route   POST /api/groups
// @access  Public
const createGroup = async (req, res) => {
  try {
    const { 
      id, 
      name, 
      category, 
      memberLimit, 
      membersVisible,
      creatorId 
    } = req.body;

    // Validate required fields
    if (!id || !name || !category) {
      return res.status(400).json({
        success: false,
        message: 'Please provide group ID, name, and category'
      });
    }

    

    // Check if group name already exists
    const existingName = await Group.findOne({ name });
    if (existingName) {
      return res.status(400).json({
        success: false,
        message: 'Group name already exists'
      });
    }

    // Validate member limit for project groups
    if (category === 'project' && (!memberLimit || memberLimit < 4 || memberLimit > 8)) {
      return res.status(400).json({
        success: false,
        message: 'Project groups must have 4-8 members'
      });
    }

    // Create group object
    const groupData = {
      id: id.trim(),
      name: name.trim(),
      category,
      memberLimit: category === 'project' ? Number(memberLimit) : null,
      members: 1,
      online: 1,
      membersVisible: membersVisible !== undefined ? membersVisible : true,
      leader: 'You',
      leaderAv: id.slice(0, 2).toUpperCase(),
      leaderColor: '#1E90FF',
      lastMsg: '',
      time: '',
      unread: 0,
      messages: [],
      announcement: { 
        author: 'You', 
        authorId: creatorId || id.trim(), 
        text: '' 
      },
      panelMembers: [
        { 
          av: id.slice(0, 2).toUpperCase(), 
          color: '#1E90FF', 
          name: 'You', 
          id: creatorId || id.trim(), 
          online: true, 
          role: 'you',
          status: 'active'
        }
      ],
      sharedFiles: [],
      memberRequests: []
    };

    const group = await Group.create(groupData);
    
    res.status(201).json({
      success: true,
      message: 'Group created successfully',
      data: group
    });
  } catch (error) {
    console.error('Create Group Error:', error);
    if (error.code === 11000) {
      // Duplicate key error
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `${field} already exists`
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Update group
// @route   PUT /api/groups/:id
// @access  Public
const updateGroup = async (req, res) => {
  try {
    const group = await Group.findOneAndUpdate(
      { id: req.params.id },
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Group updated successfully',
      data: group
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Delete group
// @route   DELETE /api/groups/:id
// @access  Public
const deleteGroup = async (req, res) => {
  try {
    const group = await Group.findOneAndDelete({ id: req.params.id });
    
    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Group deleted successfully',
      data: group
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

module.exports = {
  getGroups,
  getGroupById,
  createGroup,
  updateGroup,
  deleteGroup
};
