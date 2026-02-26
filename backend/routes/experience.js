const express = require('express');
const { authenticateToken } = require('../middleware/authMiddleware.js');
const { shareExperience, getExperiences, getSingleExperience, getComments, addComment, handleVote } = require('../controllers/experienceController.js');

const router = express.Router();

// The POST route is protected, requiring a valid JWT for access.
router.post('/share', authenticateToken, shareExperience);

// New GET route to fetch all experiences.
router.get('/', getExperiences);

router.get('/:id', getSingleExperience);

// New routes for comments and voting
router.get('/:id/comments', getComments);
router.post('/:id/comments', authenticateToken, addComment);
router.post('/:id/vote', authenticateToken, handleVote);

module.exports = router;