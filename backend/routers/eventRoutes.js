const express = require('express');
const router = express.Router();
const {createEvent,approveEvent,getPublicEvents,getPendingEvents,rejectEvent,getEventById,registerForEvent}=require('../controllers/eventController');
const {protect,authorize} = require('../middleware/auth')

// ... imports

// 1. Static Routes
router.get('/pending', protect, authorize('admin'), getPendingEvents);

// 2. General Routes
router.get('/', getPublicEvents);
router.post('/', protect, authorize('organizer', 'admin'), createEvent);

// 3. Dynamic Routes (ID based)
router.get('/:id', getEventById); // <--- NEW: Get Details
router.post('/:id/register', protect, registerForEvent); // <--- NEW: Register Action

// ... approve/reject routes
router.put('/:id/approve', protect, authorize('admin'), approveEvent);
router.put('/:id/reject', protect, authorize('admin'), rejectEvent);

module.exports = router;