const express = require('express');
const router = express.Router();
const {authenticateAdminToken} = require('../../middleware/authAdminMiddleWare');
const {
  updateExperienceStatus,
  updateExperienceData,
  getExperiences
} = require('../../controllers/admin/adminExperienceController');

// Route to get all experiences
router.get('/experiences',authenticateAdminToken, getExperiences);

// Route to update experience status (approve, reject, revert to pending)
router.put('/experience/:id/status', authenticateAdminToken, updateExperienceStatus);

// Route to update experience data
router.put('/experience/:id', authenticateAdminToken, updateExperienceData);

module.exports = router;