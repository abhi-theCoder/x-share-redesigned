const express = require('express');
const router = express.Router();
const jobController = require('../../controllers/admin/adminJobController.js');
const {authenticateAdminToken} = require('../../middleware/authAdminMiddleWare');

// Job Routes
router.post('/', authenticateAdminToken, jobController.createJob);
router.put("/:id",authenticateAdminToken, jobController.updateJob);
router.get('/', authenticateAdminToken, jobController.getJobs);
router.get('/:id', authenticateAdminToken, jobController.getJobById);
router.delete('/:id', authenticateAdminToken, jobController.deleteJob);

module.exports = router;