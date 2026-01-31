const ClubMembership = require('../models/ClubMembership');
const User = require('../models/User');

const Club = require('../models/Club'); // Ensure you have the Club model from previous steps


// @desc   User requests to join a club
// @route  POST /api/clubs/join
const joinClub = async (req, res) => {
  const { clubName } = req.body;
  try {
    const existing = await ClubMembership.findOne({ user: req.user._id, clubName });
    if (existing) return res.status(400).json({ message: "Request already sent or already a member." });

    await ClubMembership.create({ user: req.user._id, clubName });
    res.status(201).json({ message: "Membership request sent." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ... existing joinClub, approveMember, getClubRequests ...

// @desc   Get list of all clubs
// @route  GET /api/clubs
const getAllClubs = async (req, res) => {
  try {
    const clubs = await Club.find({});
    res.json(clubs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc   Get status of clubs I have joined/requested
// @route  GET /api/clubs/my-status
const getMyMemberships = async (req, res) => {
  try {
    const memberships = await ClubMembership.find({ user: req.user._id });
    res.json(memberships);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// @desc   Get pending requests for the Club Head
// @route  GET /api/clubs/my-requests
const getClubRequests = async (req, res) => {
  try {
    // 1. Ensure user manages a club
    if (!req.user.managedClub) {
      return res.status(400).json({ message: "You are not assigned to manage any club." });
    }

    // 2. Find pending requests for THIS specific club
    const requests = await ClubMembership.find({ 
      clubName: req.user.managedClub, 
      status: 'pending' 
    }).populate('user', 'name email department year');
    
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc   Approve a member
// @route  PUT /api/clubs/approve
const approveMember = async (req, res) => {
  const { membershipId } = req.body; // The ID of the request, not the user
  try {
    const membership = await ClubMembership.findById(membershipId);
    if (!membership) return res.status(404).json({ message: "Request not found" });

    // SECURITY CHECK: Does the logged-in user manage this club?
    if (req.user.managedClub !== membership.clubName) {
      return res.status(403).json({ message: "You do not have permission to manage this club." });
    }

    membership.status = 'approved';
    await membership.save();

    res.json({ message: "Member approved successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc   Reject a member
// @route  PUT /api/clubs/reject
const rejectMember = async (req, res) => {
  const { membershipId } = req.body;
  try {
    const membership = await ClubMembership.findById(membershipId);
    if (!membership) return res.status(404).json({ message: "Request not found" });

    if (req.user.managedClub !== membership.clubName) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Hard delete or set status to rejected
    await ClubMembership.findByIdAndDelete(membershipId); 

    res.json({ message: "Request rejected" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getClubRequests, approveMember, rejectMember,getAllClubs, 
  getMyMemberships, // <--- Export this
  // ... existing exports
  joinClub,
   };