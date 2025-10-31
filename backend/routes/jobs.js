const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobsController.js');
const { authenticateToken } = require('../middleware/authMiddleware.js');

// Job Routes
router.get('/', jobController.getJobs);
router.get('/:id', jobController.getJobById);

module.exports = router;