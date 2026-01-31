const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth.js');
const { 
  getResourceStats, 
  getMonthlyActivity, 
  getOrganizerLeaderboard,
  getAdvancedStats,
  exportReport
} = require('../controllers/analyticsController');

// Only Admins can view analytics
router.get('/resources', protect, authorize('admin'), getResourceStats);
router.get('/monthly', protect, authorize('admin'), getMonthlyActivity);
router.get('/leaderboard', protect, authorize('admin'), getOrganizerLeaderboard);
router.get('/advanced', protect, authorize('admin'), getAdvancedStats);
router.get('/export', protect, authorize('admin'), exportReport);

module.exports = router;