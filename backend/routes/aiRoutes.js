const express = require("express");
const router = express.Router();
const aiController = require("../controllers/aiController");

router.post("/parse", aiController.parseResume);
router.post("/rewrite", aiController.rewriteContent);
router.post("/analyze-ats", aiController.analyzeATS);

module.exports = router;
