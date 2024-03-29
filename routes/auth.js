const router = require("express").Router();
const authController = require("../controllers/authContoller");

// REGISTRATION 
router.post("/register", authController.createUser);

// LOGIN 
router.post("/login", authController.loginUser);

router.get('/home', authController.homeUser);

module.exports = router