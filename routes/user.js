const router = require("express").Router();
const userController = require("../controllers/userController");
const {verifyAndAuthorization, verifyToken} = require("../middleware/verifyToken");

// UPDATE 
router.put("/:id", verifyAndAuthorization, userController.updateUser);

// DELETE
router.delete("/:id", verifyAndAuthorization, userController.deleteUser);

module.exports = router