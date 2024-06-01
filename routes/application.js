const router = require("express").Router();
const applicationController = require("../controllers/applicationController");
const {verifyToken} = require("../middleware/verifyToken");

// POST APPLICATION
router.post("/", verifyToken, applicationController.createApplication);

// UPDATE APPLICATION
router.put("/:id", verifyToken, applicationController.updateApplication);

// DELETE PROJECT
router.delete("/:id", verifyToken, applicationController.deleteApplication);

// GET PROJECT
router.get("/:id", verifyToken, applicationController.getApplication);

// GET ALL PROJECT
router.get("/", verifyToken, applicationController.getAllApplications);

module.exports = router