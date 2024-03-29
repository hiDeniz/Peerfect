const router = require("express").Router();
const authController = require("../controllers/authContoller");

// REGISTRATION 
router.post("/register", authController.createUser);

// LOGIN 
router.post("/login", authController.loginUser);

app.get('/home', (req, res) => {
    res.send('Hello World!');
  });

module.exports = router