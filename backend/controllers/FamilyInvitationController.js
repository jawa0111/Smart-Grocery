const FamilyInvitation = require('../models/FamilyInvitation');
const User = require('../models/User');

// Create a new family invitation
exports.createInvitation = async (req, res) => {
    try {
        const { recipientEmail, relationship, permissions } = req.body;
        const sender = req.user._id;
        
        // Validate recipient email
        if (!recipientEmail || !recipientEmail.trim()) {
            return res.status(400).json({
                message: 'Recipient email is required'
            });
        }

        // Normalize email to lowercase
        const normalizedEmail = recipientEmail.toLowerCase();

        // Check if sender is already inviting this email
        const existingInvitation = await FamilyInvitation.findOne({
            sender,
            recipientEmail,
            status: 'pending'
        });

        if (existingInvitation) {
            return res.status(400).json({
                message: 'An invitation to this email is already pending'
            });
        }

        // Create new invitation with proper sender information
        const invitation = new FamilyInvitation({
            sender,
            recipientEmail: normalizedEmail,
            relationship,
            permissions,
            status: 'pending'
        });

        // Save the invitation
        const savedInvitation = await invitation.save();
        
        // Populate sender information
        const populatedInvitation = await FamilyInvitation.findById(savedInvitation._id)
          .populate('sender', 'name email');
        
        // Log the invitation details
        console.log('Created invitation:', {
            id: populatedInvitation._id,
            sender: populatedInvitation.sender,
            recipientEmail: populatedInvitation.recipientEmail,
            status: populatedInvitation.status
        });

        res.status(201).json({
            message: 'Invitation sent successfully',
            invitation: populatedInvitation
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error creating invitation',
            error: error.message
        });
    }
};

// Get all invitations for a user
exports.getInvitations = async (req, res) => {
    try {
        const user = req.user;
        
        // Validate user
        if (!user || !user.email) {
            return res.status(400).json({
                message: 'User information not found'
            });
        }
        
        // Get invitations where user is the recipient
        const receivedInvitations = await FamilyInvitation.find({
            recipientEmail: user.email.toLowerCase(),
            status: 'pending'
        }).populate('sender', 'name email');

        // Log received invitations
        console.log('Received invitations:', receivedInvitations);

        // Get invitations where user is the sender
        const sentInvitations = await FamilyInvitation.find({
            sender: user._id,
            status: { $in: ['pending', 'accepted', 'rejected'] }
        }).populate('sender', 'name email');

        // Ensure all invitations have proper sender information
        const populatedReceived = await Promise.all(
          receivedInvitations.map(invitation => 
            FamilyInvitation.findById(invitation._id).populate('sender', 'name email')
          )
        );
        const populatedSent = await Promise.all(
          sentInvitations.map(invitation => 
            FamilyInvitation.findById(invitation._id).populate('sender', 'name email')
          )
        );

        // Log sent invitations
        console.log('Sent invitations:', sentInvitations);

        res.status(200).json({
            received: populatedReceived,
            sent: populatedSent
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error fetching invitations',
            error: error.message
        });
    }
};

// Accept an invitation
exports.acceptInvitation = async (req, res) => {
    try {
        const { invitationId } = req.params;
        const user = req.user;

        const invitation = await FamilyInvitation.findOne({
            _id: invitationId,
            recipientEmail: user.email,
            status: 'pending'
        });

        if (!invitation) {
            return res.status(404).json({
                message: 'Invitation not found or already processed'
            });
        }

        // Update invitation status
        invitation.status = 'accepted';
        await invitation.save();

        // Add to user's family members
        user.familyMembers = user.familyMembers || [];
        user.familyMembers.push(invitation.sender);
        await user.save();

        // Update sender's family members
        const sender = await User.findById(invitation.sender);
        sender.familyMembers = sender.familyMembers || [];
        sender.familyMembers.push(user._id);
        await sender.save();

        res.status(200).json({
            message: 'Invitation accepted successfully',
            invitation
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error accepting invitation',
            error: error.message
        });
    }
};

// Reject an invitation
exports.rejectInvitation = async (req, res) => {
    try {
        const { invitationId } = req.params;
        const user = req.user;

        const invitation = await FamilyInvitation.findOne({
            _id: invitationId,
            recipientEmail: user.email,
            status: 'pending'
        });

        if (!invitation) {
            return res.status(404).json({
                message: 'Invitation not found or already processed'
            });
        }

        invitation.status = 'rejected';
        await invitation.save();

        res.status(200).json({
            message: 'Invitation rejected successfully'
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error rejecting invitation',
            error: error.message
        });
    }
};
