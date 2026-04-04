const express = require('express');
const multer = require('multer');
const router = express.Router();
const {
  getAllResources,
  getFilteredResources,
  createResource,
  updateResourceStatus,
  deleteResource,
  toggleLike,
  addComment,
  addReport
} = require('../controllers/resourceController');

// GET /api/resources - Get all resources from MongoDB
router.get('/', getAllResources);

// GET /api/resources/filter - Get filtered resources from MongoDB
router.get('/filter', getFilteredResources);

// POST /api/resources - Create new resource and save to MongoDB (with file upload)
router.post('/', (req, res, next) => {
  const upload = req.upload.single('pdfFile');
  upload(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({
        success: false,
        message: 'File upload error: ' + err.message
      });
    } else if (err) {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }
    next();
  });
}, createResource);

// PUT /api/resources/:id - Toggle like/unlike for a resource
router.put('/:id', toggleLike);

// PUT /api/resources/:id/status - Update resource status in MongoDB
router.put('/:id/status', updateResourceStatus);

// POST /api/resources/:id/comments - Add comment to a resource
router.post('/:id/comments', addComment);

// POST /api/resources/:id/reports - Add report to a resource
router.post('/:id/reports', addReport);

// DELETE /api/resources/:id - Delete resource from MongoDB
router.delete('/:id', deleteResource);

module.exports = router;
