const router = require("express").Router();
const authController = require("../controllers/authContoller");

// REGISTRATION 
router.post("/register", authController.createUser);

// LOGIN 
router.post("/login", authController.loginUser);

// VERIFY
router.post("/verify-email", authController.verifyEmail);

//deploy test
router.get('/home', authController.homeUser);

module.exports = router