const express = require('express');
const router = express.Router();
const Club = require('../models/Club');
const {registerUser,loginUser,getMe,getAllUsers,updateUserRole,getPendingRoleRequestsCount} = require('../controllers/authController');
const {protect,authorize} = require('../middleware/auth');


router.post('/register',registerUser);
router.post('/login',loginUser);
router.get('/pending-requests', protect, getPendingRoleRequestsCount);
router.get('/clubs', async (req, res) => res.json(await Club.find({})));
router.get('/me',protect,getMe);
router.get('/users', protect, authorize('admin'), getAllUsers);
router.put('/users/:id/role', protect, authorize('admin'), updateUserRole);

module.exports = router;
