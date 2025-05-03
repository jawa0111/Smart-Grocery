import React, { useState, useEffect } from 'react';
import {
  createFamilyInvitation,
  getFamilyInvitations,
  acceptFamilyInvitation,
  rejectFamilyInvitation
} from '../api/api';

// Get the current user object from localStorage with proper error handling
const getCurrentUser = () => {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.email) {
      throw new Error('User email not found');
    }
    return user;
  } catch (error) {
    console.error('Error getting current user:', error);
    return {};
  }
};

const FamilyMembers = () => {
  const [invitations, setInvitations] = useState({
    received: [],
    sent: []
  });
  const [newInvitation, setNewInvitation] = useState({
    recipientEmail: '',
    relationship: 'other',
    permissions: {
      view_inventory: false,
      edit_inventory: false
    }
  });

  const formatInvitationData = (invitation) => ({
    sender: getCurrentUser()._id,
    recipientEmail: invitation.recipientEmail.toLowerCase(),
    relationship: invitation.relationship,
    permissions: {
      view_inventory: invitation.permissions.view_inventory,
      edit_inventory: invitation.permissions.edit_inventory
    },
    status: 'pending'
  });

  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchInvitations();
  }, []);

  const fetchInvitations = async () => {
    try {
      const data = await getFamilyInvitations();
      console.log('Fetched invitations:', data);
      setInvitations(data);
    } catch (error) {
      console.error('Error fetching invitations:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterInvitations = (invitations) => {
    if (!searchTerm) return invitations;
    const term = searchTerm.toLowerCase();
    return invitations.filter(invitation =>
      invitation.sender.name.toLowerCase().includes(term) ||
      invitation.recipientEmail.toLowerCase().includes(term) ||
      invitation.relationship.toLowerCase().includes(term)
    );
  };

  const handleInviteSubmit = async (e) => {
    e.preventDefault();
    try {
      const invitationData = formatInvitationData(newInvitation);
      console.log('Sending invitation:', invitationData);
      await createFamilyInvitation(invitationData);
      setNewInvitation({
        recipientEmail: '',
        relationship: 'other',
        permissions: {
          view_inventory: false,
          edit_inventory: false
        }
      });
      setSuccess('Invitation sent successfully!');
      await fetchInvitations();
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to send invitation');
      console.error('Error creating invitation:', error);
    }
  };

  const handleAcceptInvitation = async (invitationId) => {
    try {
      await acceptFamilyInvitation(invitationId);
      await fetchInvitations();
    } catch (error) {
      console.error('Error accepting invitation:', error);
    }
  };

  const handleRejectInvitation = async (invitationId) => {
    try {
      await rejectFamilyInvitation(invitationId);
      await fetchInvitations();
    } catch (error) {
      console.error('Error rejecting invitation:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Family Members</h1>

      {/* Invite New Member Form */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Invite New Member</h2>
        <form onSubmit={handleInviteSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md">
              {success}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <input
              type="email"
              value={newInvitation.recipientEmail}
              onChange={(e) => setNewInvitation({ ...newInvitation, recipientEmail: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Relationship
            </label>
            <select
              value={newInvitation.relationship}
              onChange={(e) => setNewInvitation({ ...newInvitation, relationship: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="parent">Parent</option>
              <option value="child">Child</option>
              <option value="sibling">Sibling</option>
              <option value="spouse">Spouse</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={newInvitation.permissions.view_inventory}
                  onChange={(e) => {
                    const permissions = { ...newInvitation.permissions };
                    permissions.view_inventory = e.target.checked;
                    setNewInvitation({ ...newInvitation, permissions });
                  }}
                  className="mr-2"
                />
                <span>View Inventory</span>
              </label>
            </div>
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={newInvitation.permissions.edit_inventory}
                  onChange={(e) => {
                    const permissions = { ...newInvitation.permissions };
                    permissions.edit_inventory = e.target.checked;
                    setNewInvitation({ ...newInvitation, permissions });
                  }}
                  className="mr-2"
                />
                <span>Edit Inventory</span>
              </label>
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Send Invitation
          </button>
        </form>
      </div>

      {/* Received Invitations */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Received Invitations</h2>
          <div className="relative">
            <input
              type="text"
              placeholder="Search invitations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64 px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        {loading ? (
          <div className="text-center py-4">Loading...</div>
        ) : (
          <div className="space-y-4">
            {invitations.received.length === 0 ? (
              <p className="text-gray-500">No pending invitations.</p>
            ) : (
              invitations.received.map((invitation) => (
                <div
                  key={invitation._id}
                  className="border rounded-lg p-4 flex justify-between items-center"
                >
                  <div>
                    <p className="font-medium">From: {invitation.sender?.name || 'Unknown'}</p>
                    <p className="text-sm text-gray-600">Relationship: {invitation.relationship}</p>
                    {invitation.permissions.view_inventory && (
                      <p className="text-sm text-gray-600">Can view inventory</p>
                    )}
                    {invitation.permissions.edit_inventory && (
                      <p className="text-sm text-gray-600">Can edit inventory</p>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleAcceptInvitation(invitation._id)}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleRejectInvitation(invitation._id)}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Sent Invitations */}
      <div className="mt-8 bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Sent Invitations</h2>
        {loading ? (
          <div className="text-center py-4">Loading...</div>
        ) : (
          <div className="space-y-4">
            {invitations.sent.length === 0 ? (
              <p className="text-gray-500">No sent invitations.</p>
            ) : (
              invitations.sent.map((invitation) => (
                <div
                  key={invitation._id}
                  className="border rounded-lg p-4 flex justify-between items-center"
                >
                  <div>
                    <p className="font-medium">To: {invitation.recipientEmail}</p>
                    <p className="text-sm text-gray-600">Relationship: {invitation.relationship}</p>
                    <p className="text-sm text-gray-600">Status: {invitation.status}</p>
                    {invitation.permissions.view_inventory && (
                      <p className="text-sm text-gray-600">Can view inventory</p>
                    )}
                    {invitation.permissions.edit_inventory && (
                      <p className="text-sm text-gray-600">Can edit inventory</p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FamilyMembers;
