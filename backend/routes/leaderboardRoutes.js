const express = require('express');
const { leaderboard } = require('../controllers/leaderboardController.js');
const { authenticateToken } = require('../middleware/authMiddleware.js');
// const { authenticateToken } = require('../middleware/authMiddleware.js');

const router = express.Router();

// Get leaderboard data
router.get('/', authenticateToken, leaderboard);

module.exports = router;