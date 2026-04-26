const mongoose = require('mongoose');
const Group = require('../models/Group');

const getLegacyGroupsCollection = () => mongoose.connection.db.collection('creategroups');

const sortByNewest = (a, b) => {
  const aTime = a?.createdAt ? new Date(a.createdAt).getTime() : 0;
  const bTime = b?.createdAt ? new Date(b.createdAt).getTime() : 0;
  return bTime - aTime;
};

const mergeGroups = (primaryGroups = [], legacyGroups = []) => {
  const byId = new Map();

  [...legacyGroups, ...primaryGroups].forEach((group) => {
    if (!group?.id) return;
    byId.set(group.id, group);
  });

  return Array.from(byId.values()).sort(sortByNewest);
};

const findLegacyGroupById = async (id) => {
  return getLegacyGroupsCollection().findOne({ id });
};

// @desc    Get all groups
// @route   GET /api/groups
// @access  Public
const getGroups = async (req, res) => {
  try {
    const [groups, legacyGroups] = await Promise.all([
      Group.find({}).lean(),
      getLegacyGroupsCollection().find({}).toArray(),
    ]);

    const mergedGroups = mergeGroups(groups, legacyGroups);

    res.status(200).json({
      success: true,
      count: mergedGroups.length,
      data: mergedGroups,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message,
    });
  }
};

// @desc    Get single group by ID
// @route   GET /api/groups/:id
// @access  Public
const getGroupById = async (req, res) => {
  try {
    const group = await Group.findOne({ id: req.params.id }).lean();
    const legacyGroup = group ? null : await findLegacyGroupById(req.params.id);
    const foundGroup = group || legacyGroup;

    if (!foundGroup) {
      return res.status(404).json({
        success: false,
        message: 'Group not found',
      });
    }

    res.status(200).json({
      success: true,
      data: foundGroup,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message,
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
      creatorId,
    } = req.body;

    if (!id || !name || !category) {
      return res.status(400).json({
        success: false,
        message: 'Please provide group ID, name, and category',
      });
    }

    const [existingName, existingLegacyName] = await Promise.all([
      Group.findOne({ name }),
      getLegacyGroupsCollection().findOne({ name }),
    ]);

    if (existingName || existingLegacyName) {
      return res.status(400).json({
        success: false,
        message: 'Group name already exists',
      });
    }

    if (category === 'project' && (!memberLimit || memberLimit < 4 || memberLimit > 8)) {
      return res.status(400).json({
        success: false,
        message: 'Project groups must have 4-8 members',
      });
    }

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
        text: '',
      },
      panelMembers: [
        {
          av: id.slice(0, 2).toUpperCase(),
          color: '#1E90FF',
          name: 'You',
          id: creatorId || id.trim(),
          online: true,
          role: 'you',
          status: 'active',
        },
      ],
      sharedFiles: [],
      memberRequests: [],
    };

    const group = await Group.create(groupData);

    res.status(201).json({
      success: true,
      message: 'Group created successfully',
      data: group,
    });
  } catch (error) {
    console.error('Create Group Error:', error);
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: field + ' already exists',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message,
    });
  }
};

// @desc    Update group
// @route   PUT /api/groups/:id
// @access  Public
const updateGroup = async (req, res) => {
  try {
    let group = await Group.findOneAndUpdate(
      { id: req.params.id },
      req.body,
      { new: true, runValidators: true }
    ).lean();

    if (!group) {
      const legacyCollection = getLegacyGroupsCollection();
      const legacyGroup = await legacyCollection.findOne({ id: req.params.id });

      if (!legacyGroup) {
        return res.status(404).json({
          success: false,
          message: 'Group not found',
        });
      }

      await legacyCollection.updateOne({ id: req.params.id }, { $set: req.body });
      group = await legacyCollection.findOne({ id: req.params.id });
    }

    res.status(200).json({
      success: true,
      message: 'Group updated successfully',
      data: group,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message,
    });
  }
};

// @desc    Delete group
// @route   DELETE /api/groups/:id
// @access  Public
const deleteGroup = async (req, res) => {
  try {
    const [group, legacyDeleteResult] = await Promise.all([
      Group.findOneAndDelete({ id: req.params.id }).lean(),
      getLegacyGroupsCollection().findOneAndDelete({ id: req.params.id }),
    ]);

    const deletedGroup = group || legacyDeleteResult?.value || legacyDeleteResult;

    if (!deletedGroup) {
      return res.status(404).json({
        success: false,
        message: 'Group not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Group deleted successfully',
      data: deletedGroup,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message,
    });
  }
};

module.exports = {
  getGroups,
  getGroupById,
  createGroup,
  updateGroup,
  deleteGroup,
};
