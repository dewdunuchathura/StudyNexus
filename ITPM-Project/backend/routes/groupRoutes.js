import express from 'express';
import {
  getGroups,
  getGroupById,
  createGroup,
  updateGroup,
  deleteGroup
} from '../controllers/groupController.js';

const router = express.Router();

// Route for getting all groups
router.route('/')
  .get(getGroups)
  .post(createGroup);

// Route for single group operations
router.route('/:id')
  .get(getGroupById)
  .put(updateGroup)
  .delete(deleteGroup);

export default router;
