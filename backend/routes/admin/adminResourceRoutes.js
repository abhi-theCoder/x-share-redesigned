const express = require( "express");
const multer = require("multer");
const {authenticateAdminToken} = require('../../middleware/authAdminMiddleWare');
const {
  getAllResources,
  uploadResource,
  rateResource,
  incrementDownload,
  updateResource,
  deleteResource,
} = require("../../controllers/admin/adminResourceController.js");
const { route } = require("../auth.js");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get("/", authenticateAdminToken, getAllResources);
router.post("/upload", upload.single("file"), authenticateAdminToken, uploadResource);

// route to update a resource
router.put("/:id", upload.single("file"), authenticateAdminToken, updateResource);

// route to delete a resource
router.delete("/:id", authenticateAdminToken, deleteResource);

router.put("/:id/rate", rateResource);
router.put("/:id/download", incrementDownload);

module.exports = router;