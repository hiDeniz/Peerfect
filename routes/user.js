const router = require("express").Router();
const userController = require("../controllers/userController");
const {verifyAndAuthorization, verifyToken, verifyAndAdmin, verifyAndOtherAuthorization} = require("../middleware/verifyToken");

// UPDATE 
router.put("/:id", verifyAndAuthorization, userController.updateUser);

// DELETE
router.delete("/:id", verifyAndAuthorization, userController.deleteUser);

// GET
router.get("/:id", verifyAndOtherAuthorization, userController.getUser);

// GET ALL USERS
router.get("/", verifyAndAdmin, userController.getAllUsers);

// GET POST of USER
router.get("/post/:id", verifyAndOtherAuthorization, userController.getUserPost);

// GET REVIEW of USER
router.get("/review/:id", verifyAndOtherAuthorization, userController.getUserReview);

// GET HOME PAGE of USER
router.get("/homePage/:id", verifyAndAuthorization, userController.getUserHomePage);

module.exports = router