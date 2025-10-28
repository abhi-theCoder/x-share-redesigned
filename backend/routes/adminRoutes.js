const express = require("express");
const router = express.Router();
const isAdmin = require("../middleware/isAdmin");

router.get("/check", isAdmin, (req, res) => {
  res.json({ isAdmin: req.isAdmin, user: req.user });
});

module.exports = router;
