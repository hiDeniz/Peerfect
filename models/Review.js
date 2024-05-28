const mongoose = require("mongoose");

const ReviewSchema = new mongoose.Schema(
    {
        owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        rating: { type: Number, min: 0, max: 5, required: true },
        comment: { type: String, required: true}
    }
);

module.exports = mongoose.model("Review", ReviewSchema);