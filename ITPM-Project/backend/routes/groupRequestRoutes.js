import express from 'express';
import {
  requestToJoinGroup,
  getGroupRequests,
  acceptGroupRequest,
  rejectGroupRequest,
  getUserRequests
} from '../controllers/groupRequestController.js';

const router = express.Router();

// Group request routes
router.route('/:groupId/requests')
  .post(requestToJoinGroup)
  .get(getGroupRequests);

// Individual request actions
router.route('/:groupId/requests/:requestId/accept')
  .put(acceptGroupRequest);

router.route('/:groupId/requests/:requestId/reject')
  .put(rejectGroupRequest);

// User request history
router.route('/users/:userId/requests')
  .get(getUserRequests);

export default router;
