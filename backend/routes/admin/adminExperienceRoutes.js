const express = require('express');
const router = express.Router();
const {authenticateAdminToken} = require('../../middleware/authAdminMiddleWare');
const isAdmin = require('../../middleware/isAdmin'); // ✅ add this import
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


// ✅ Route to check admin status (your old route)
router.get('/check', isAdmin, (req, res) => {
  res.json({ isAdmin: req.isAdmin, user: req.user });
});

module.exports = router;