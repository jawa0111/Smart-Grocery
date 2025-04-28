const express = require('express');
const router = express.Router();
const {
  getUserProfile,
  updateUserProfile,
  deleteUserProfile
} = require('../controllers/userController');

// Get user profile
router.get('/profile/:id', getUserProfile);

// Update user profile
router.put('/profile/:id', updateUserProfile);

// Delete user profile
router.delete('/profile/:id', deleteUserProfile);

module.exports = router; 