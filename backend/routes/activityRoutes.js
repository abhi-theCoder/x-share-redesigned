const express = require('express');
const { authenticateToken } = require('../middleware/authMiddleware.js');
const { getActivityData, addActivity, getPublicActivityData } = require('../controllers/activityController.js');

const router = express.Router();

router.get('/', authenticateToken, getActivityData);
router.post('/add', authenticateToken, addActivity);


//Get public activity data
router.get('/public/:userId', getPublicActivityData);
module.exports = router;
