const express = require('express');
const router = express.Router();
const resourceController = require('../controllers/resourceController.js');
const { authenticateToken } = require('../middleware/authMiddleware.js');

// Job Routes
router.get('/', authenticateToken, resourceController.getAllResources);
router.put("/:id/rate", authenticateToken, resourceController.rateResource);
router.put("/:id/download", authenticateToken, resourceController.incrementDownload);

module.exports = router;