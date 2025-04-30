const FamilyInvitation = require('../models/FamilyInvitation');
const User = require('../models/User');

// Create a new family invitation
exports.createInvitation = async (req, res) => {
    try {
        const { recipientEmail, relationship, permissions } = req.body;
        const sender = req.user.id;

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

        // Create new invitation
        const invitation = new FamilyInvitation({
            sender,
            recipientEmail,
            relationship,
            permissions
        });

        await invitation.save();

        res.status(201).json({
            message: 'Invitation sent successfully',
            invitation
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
        
        // Get invitations where user is the recipient
        const receivedInvitations = await FamilyInvitation.find({
            recipientEmail: user.email,
            status: 'pending'
        }).populate('sender', 'name email');

        // Get invitations where user is the sender
        const sentInvitations = await FamilyInvitation.find({
            sender: user._id,
            status: { $in: ['pending', 'accepted', 'rejected'] }
        }).populate('sender', 'name email');

        res.status(200).json({
            received: receivedInvitations,
            sent: sentInvitations
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
