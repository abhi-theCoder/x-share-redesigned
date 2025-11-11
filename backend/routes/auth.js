const express = require('express');
const { registerUser, loginUser } = require('../controllers/authController.js');
const {authenticateAdminToken} = require('../middleware/authAdminMiddleWare.js');
const router = express.Router();

// Route for user registration. It calls the registerUser function from the controller.
router.post('/register', registerUser);

// Route for user login. It calls the loginUser function from the controller.
router.post('/login', loginUser);

// Route to check if the logged-in user is an admin
router.get("/check-admin", authenticateAdminToken, (req, res) => {
  if (req.user.role === "admin" || req.user.role === "superadmin") {
    return res.json({ isAdmin: true });
  } else {
    return res.json({ isAdmin: false });
  }
});

module.exports = router;