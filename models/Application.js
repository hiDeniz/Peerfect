const mongoose = require("mongoose");

const ApplicationSchema = new mongoose.Schema(
    {
        owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        applicationTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
        status: { type: String, required: true}
    }
);

module.exports = mongoose.model("Application", ApplicationSchema);