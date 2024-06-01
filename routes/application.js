const router = require("express").Router();
const applicationController = require("../controllers/applicationController");
const {verifyToken} = require("../middleware/verifyToken");

// POST APPLICATION
router.post("/", verifyToken, applicationController.createApplication);

module.exports = router