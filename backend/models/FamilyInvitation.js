const mongoose = require('mongoose');

const invitationSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    recipientEmail: {
        type: String,
        required: true,
        lowercase: true
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected'],
        default: 'pending'
    },
    relationship: {
        type: String,
        required: true,
        enum: ['parent', 'child', 'sibling', 'spouse', 'other']
    },
    permissions: {
        view_inventory: {
            type: Boolean,
            default: false
        },
        edit_inventory: {
            type: Boolean,
            default: false
        }
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    expiresAt: {
        type: Date,
        default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days expiration
    }
});

// Index for faster lookups
invitationSchema.index({ recipientEmail: 1, status: 1 });

const FamilyInvitation = mongoose.models.FamilyInvitation || mongoose.model('FamilyInvitation', invitationSchema);

module.exports = FamilyInvitation;
