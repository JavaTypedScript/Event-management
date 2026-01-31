const mongoose = require('mongoose');

const clubMembershipSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  clubName: { type: String, required: true }, // e.g., "Robotics Club"
  status: { type: String, enum: ['pending', 'approved'], default: 'pending' },
  joinedAt: { type: Date, default: Date.now }
});

// Ensure a user can't request to join the same club twice
clubMembershipSchema.index({ user: 1, clubName: 1 }, { unique: true });

module.exports = mongoose.model('ClubMembership', clubMembershipSchema);