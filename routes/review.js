const router = require("express").Router();
const reviewController = require("../controllers/reviewController");
const {verifyToken} = require("../middleware/verifyToken");

// POST REVIEW
router.post("/", verifyToken, reviewController.createReview);

// UPDATE REVIEW
router.put("/:id", verifyToken, reviewController.updateReview);

// DELETE REVIEW
router.delete("/:id", verifyToken, reviewController.deleteReview);

// GET REVIEW
router.get("/:id", verifyToken, reviewController.getReview);

// GET ALL REVIEWS
router.get("/", verifyToken, reviewController.getAllReviews);

module.exports = router