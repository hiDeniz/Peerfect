const Review = require("../models/Review");
const User = require("../models/User");

module.exports = {
    // Create Review function
    createReview: async (req, res) => {
        const newReview = new Review(req.body);

        try{
            const savedReview = await newReview.save();

            await User.findByIdAndUpdate(
                req.body.reviewTo,
                { $push: { reviews: savedReview._id } },
                { new: true }
            );
            
            const {__v, createdAt, updatedAt, ...newReviewInfo} = savedReview._doc; 

            res.status(201).json(newReviewInfo);

        } catch (error){
            res.status(500).json(error);
        }
    },

    // Update Review func
    updateReview: async (req, res) => {
        try {
            const updatedReview = await Review.findByIdAndUpdate(
                req.params.id,
                {$set: req.body},
                {new: true}
            );
            const {__v, createdAt, updatedAt, ...updatedReviewInfo} = updatedReview._doc;
            res.status(200).json(updatedReviewInfo);
        } catch (error) {
            res.status(500).json(error);
        }
    },

    // Delete Review func
    deleteReview: async (req, res) => {
        try {
            const review = await Review.findById(req.params.id);
            if (!review) {
                return res.status(404).json({ message: "Review not found" });
            }

            // Remove the review ID from the user's reviews array
            await User.findByIdAndUpdate(
                review.reviewTo,
                { $pull: { reviews: review._id } }
            );

            // Delete the review
            await Review.findByIdAndDelete(req.params.id);

            res.status(200).json({ message: "Review successfully deleted" });
        } catch (error) {
            console.error(error); // Log the error for debugging purposes
            res.status(500).json({ message: "Internal server error", error: error.message });
        }
    },

    // Get Review func
    getReview: async (req, res) => {
        try {
            const review = await Review.findById(req.params.id);
                
            res.status(200).json(review);
        } catch (error) {
            res.status(500).json(error);
        }
    },

    // Get All Review func
    getAllReviews: async (req, res) => {
        try {
            const review = await Review.find()
            res.status(200).json(review);
        } catch (error) {
            res.status(500).json(error);
        }
    }
}