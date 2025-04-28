const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getUserProfile,
  updateUserProfile,
  deleteUserProfile
} = require('../controllers/userController');

// Get user profile
router.get('/profile/:id', protect, getUserProfile);

// Update user profile
router.put('/profile/:id', protect, updateUserProfile);

// Delete user profile
router.delete('/profile/:id', protect, deleteUserProfile);

module.exports = router; 