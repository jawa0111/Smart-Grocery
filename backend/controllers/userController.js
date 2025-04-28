const User = require('../models/User');
const UserProfile = require('../models/UserProfile');

// Get user profile
exports.getUserProfile = async (req, res) => {
  try {
    // First try to get from UserProfile collection
    let profile = await UserProfile.findOne({ userId: req.params.id });
    
    // If not found, get from User collection and create a profile
    if (!profile) {
      const user = await User.findById(req.params.id).select('-password');
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Create a new profile
      profile = await UserProfile.create({
        userId: user._id,
        name: user.name,
        email: user.email
      });
    }
    
    res.json(profile);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update user profile
exports.updateUserProfile = async (req, res) => {
  try {
    const { name, phone, address, city, state, zipCode } = req.body;
    console.log('Update request body:', req.body);
    
    // Get the user to ensure it exists
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Find or create profile
    let profile = await UserProfile.findOne({ userId: req.params.id });
    if (!profile) {
      profile = new UserProfile({
        userId: user._id,
        name: user.name,
        email: user.email
      });
    }

    // Update profile fields
    if (name) profile.name = name;
    if (phone) profile.phone = phone;
    if (address) profile.address = address;
    if (city) profile.city = city;
    if (state) profile.state = state;
    if (zipCode) profile.zipCode = zipCode;
    profile.updatedAt = Date.now();

    const updatedProfile = await profile.save();
    console.log('Updated profile:', updatedProfile);
    
    res.json({ 
      message: 'Profile updated successfully', 
      user: updatedProfile
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete user profile
exports.deleteUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete from both collections
    await UserProfile.deleteOne({ userId: req.params.id });
    await User.deleteOne({ _id: req.params.id });
    
    res.json({ message: 'User profile deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ message: 'Server error' });
  }
}; 