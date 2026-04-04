const Resource = require('../models/Resource');
const Joi = require('joi');
const mongoose = require('mongoose');

// Validation schemas
const resourceValidationSchema = Joi.object({
  title: Joi.string().required().min(3).max(100),
  category: Joi.string().required().valid('Computer Science', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Engineering'),
  description: Joi.string().required().min(10).max(500),
  author: Joi.string().required(),
  authorEmail: Joi.string().email().required(),
  fileName: Joi.string().optional(),
  fileSize: Joi.string().optional(),
  filePath: Joi.string().optional()
});

// Get all resources
const getAllResources = async (req, res) => {
  try {
    const resources = await Resource.find().sort({ uploadDate: -1 });
    res.status(200).json({
      success: true,
      data: resources,
      message: 'Resources retrieved successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving resources',
      error: error.message
    });
  }
};

// Get filtered resources
const getFilteredResources = async (req, res) => {
  try {
    const { searchTerm, category, status, showReportedOnly } = req.query;
    
    let filter = {};
    
    if (searchTerm) {
      filter.$text = { $search: searchTerm };
    }
    
    if (category && category !== 'All') {
      filter.category = category;
    }
    
    if (status && status !== 'All') {
      filter.status = status;
    }
    
    if (showReportedOnly === 'true') {
      filter.reports = { $exists: true, $ne: [] };
    }
    
    const resources = await Resource.find(filter).sort({ uploadDate: -1 });
    
    res.status(200).json({
      success: true,
      data: resources,
      message: 'Filtered resources retrieved successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving filtered resources',
      error: error.message
    });
  }
};

// Create new resource
const createResource = async (req, res) => {
  try {
    // Validate input
    const { error, value } = resourceValidationSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        error: error.details[0].message
      });
    }
    
    // Handle file upload
    let fileData = {};
    if (req.file) {
      fileData = {
        fileName: req.file.originalname,
        fileSize: `${(req.file.size / 1024 / 1024).toFixed(2)} MB`,
        filePath: req.file.path.replace(/\\/g, '/') // Convert Windows path to Unix path
      };
    }
    
    // Create new resource with MongoDB
    const resource = new Resource({
      ...value,
      ...fileData
    });
    await resource.save();
    
    console.log('Resource saved to MongoDB:', resource.title);
    if (req.file) {
      console.log('File uploaded:', req.file.originalname);
    }
    
    res.status(201).json({
      success: true,
      data: resource,
      message: 'Resource created and saved to MongoDB successfully'
    });
  } catch (error) {
    console.error('Error saving resource to MongoDB:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating resource',
      error: error.message
    });
  }
};

// Update resource status
const updateResourceStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!['approved', 'pending', 'reported'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }
    
    const resource = await Resource.findByIdAndUpdate(
      id,
      { 
        status,
        reports: status === 'approved' ? [] : undefined
      },
      { new: true }
    );
    
    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      });
    }
    
    console.log('Resource status updated in MongoDB:', resource.title, 'to', status);
    
    res.status(200).json({
      success: true,
      data: resource,
      message: 'Resource status updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating resource status',
      error: error.message
    });
  }
};

// Delete resource
const deleteResource = async (req, res) => {
  try {
    const { id } = req.params;
    
    const resource = await Resource.findByIdAndDelete(id);
    
    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      });
    }
    
    console.log('Resource deleted from MongoDB:', resource.title);
    
    res.status(200).json({
      success: true,
      message: 'Resource deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting resource',
      error: error.message
    });
  }
};

// Toggle likes for a resource (like/unlike)
const toggleLike = async (req, res) => {
  try {
    const { id } = req.params;
    const { currentLikes, isLiked } = req.body;
    
    if (typeof currentLikes !== 'number') {
      return res.status(400).json({
        success: false,
        message: 'Current likes count is required'
      });
    }
    
    // Toggle like count: if currently liked, decrement; if not liked, increment
    const newLikes = isLiked ? currentLikes - 1 : currentLikes + 1;
    
    const resource = await Resource.findByIdAndUpdate(
      id,
      { likes: newLikes },
      { new: true, runValidators: true }
    );
    
    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: {
        ...resource.toObject(),
        likes: newLikes
      },
      message: isLiked ? 'Resource unliked successfully' : 'Resource liked successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error toggling like',
      error: error.message
    });
  }
};

// Add comment to a resource
const addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { author, text } = req.body;
    
    if (!author || !text) {
      return res.status(400).json({
        success: false,
        message: 'Author and text are required'
      });
    }
    
    // Generate a unique ID for the comment
    const commentId = new mongoose.Types.ObjectId().toString();
    
    const resource = await Resource.findByIdAndUpdate(
      id,
      { 
        $push: { 
          comments: {
            id: commentId,
            author,
            text,
            date: new Date()
          }
        }
      },
      { new: true, runValidators: true }
    );
    
    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      });
    }
    
    const newComment = resource.comments[resource.comments.length - 1];
    
    res.status(200).json({
      success: true,
      data: { comment: newComment },
      message: 'Comment added successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error adding comment',
      error: error.message
    });
  }
};

// Add report to a resource
const addReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { reporter, reason, description } = req.body;
    
    if (!reporter || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Reporter and reason are required'
      });
    }
    
    // Generate a unique ID for the report
    const reportId = new mongoose.Types.ObjectId().toString();
    
    const resource = await Resource.findByIdAndUpdate(
      id,
      { 
        $push: { 
          reports: {
            id: reportId,
            reporter,
            reason,
            description,
            date: new Date()
          }
        },
        status: 'reported'
      },
      { new: true, runValidators: true }
    );
    
    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      });
    }
    
    const newReport = resource.reports[resource.reports.length - 1];
    
    res.status(200).json({
      success: true,
      data: { report: newReport },
      message: 'Report added successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error adding report',
      error: error.message
    });
  }
};

module.exports = {
  getAllResources,
  getFilteredResources,
  createResource,
  updateResourceStatus,
  deleteResource,
  toggleLike,
  addComment,
  addReport
};
