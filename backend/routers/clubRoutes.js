const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { 
  getAllClubs, 
  joinClub, 
  approveMember, 
  getClubRequests,
  getMyMemberships,
  rejectMember 
} = require('../controllers/clubController');

// Public: List clubs (so users can see them before login if desired, or protect it)
router.get('/', getAllClubs);

// Protected
router.post('/join', protect, joinClub);
router.get('/my-status', protect, getMyMemberships); // Status of my requests
router.get('/my-requests', protect, getClubRequests); // For Organizers to see pending people
router.put('/approve', protect, approveMember);
router.put('/reject', protect, rejectMember);
router.put('/approve', protect, approveMember);       // For Organizers to approve

module.exports = router;