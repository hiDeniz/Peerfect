const router = require("express").Router();
const authController = require("../controllers/authController");

// REGISTRATION 
router.post("/register", authController.createUser);

// LOGIN 
router.post("/login", authController.loginUser);

// VERIFY
router.post("/verify-email", authController.verifyEmail);

module.exports = router