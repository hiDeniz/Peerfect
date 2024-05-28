const router = require("express").Router();
const projectController = require("../controllers/projectController");
const {verifyToken} = require("../middleware/verifyToken");

// POST PROJECT
router.post("/", verifyToken, projectController.createProject);

// UPDATE PROJECT
router.put("/:id", verifyToken, projectController.updateProject);

// DELETE PROJECT
router.delete("/:id", verifyToken, projectController.deleteProject);

// GET PROJECT
router.get("/:id", verifyToken, projectController.getProject);

// GET ALL PROJECT
router.get("/", verifyToken, projectController.getAllProjects);

module.exports = router