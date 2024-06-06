const router = require("express").Router();
const applicationController = require("../controllers/applicationController");
const {verifyToken} = require("../middleware/verifyToken");

// POST APPLICATION
router.post("/", verifyToken, applicationController.createApplication);

// UPDATE APPLICATION
router.put("/:id", verifyToken, applicationController.updateApplication);

// DELETE APPLICATION
router.delete("/:id", verifyToken, applicationController.deleteApplication);

// GET APPLICATION
router.get("/:id", verifyToken, applicationController.getApplication);

// GET ALL APPLICATION
router.get("/", verifyToken, applicationController.getAllApplications);

// GET All APPLICATION for a USER
router.get("/user/:id", verifyToken, applicationController.getAllApplicationsForUser);

module.exports = router