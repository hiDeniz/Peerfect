const router = require("express").Router();
const userController = require("../controllers/userController");
const {verifyAndAuthorization, verifyToken, verifyAndAdmin} = require("../middleware/verifyToken");

// UPDATE 
router.put("/:id", verifyAndAuthorization, userController.updateUser);

// DELETE
router.delete("/:id", verifyAndAuthorization, userController.deleteUser);

// GET
router.get("/:id", verifyAndAuthorization, userController.getUser);

// GET ALL USERS
router.get("/", verifyAndAdmin, userController.getAllUsers);

module.exports = router