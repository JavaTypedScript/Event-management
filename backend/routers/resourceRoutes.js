const express = require('express');
const router = express.Router();
const {getAllResources,checkAvailabilty,bookResource} = require('../controllers/resourceController');
const {protect,authorize} = require('../middleware/auth');

router.get('/',getAllResources);
router.post('/check',protect,checkAvailabilty);
router.post('/book',protect,authorize('organizer','admin'),bookResource);

module.exports = router;
