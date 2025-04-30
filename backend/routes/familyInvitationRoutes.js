const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const FamilyInvitationController = require('../controllers/FamilyInvitationController');

// Apply auth middleware to all routes
router.use(auth);

// Create a new family invitation
router.post('/', FamilyInvitationController.createInvitation);

// Get all invitations for a user
router.get('/', FamilyInvitationController.getInvitations);

// Accept an invitation
router.put('/:invitationId/accept', FamilyInvitationController.acceptInvitation);

// Reject an invitation
router.put('/:invitationId/reject', FamilyInvitationController.rejectInvitation);

module.exports = router;
