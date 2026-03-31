const express = require('express');
const { getQuestions, postQuestion, addComment, handleVoteQuestion } = require('../controllers/qnaController.js');
const { authenticateToken } = require('../middleware/authMiddleware.js');
const router = express.Router();

// Get all questions with comments
router.get('/', getQuestions);

// Post a new question
router.post('/question', authenticateToken, postQuestion);

// Post a comment
router.post('/comment', authenticateToken, addComment);

// Vote on a question
router.post('/:id/vote', authenticateToken, handleVoteQuestion);

module.exports = router;