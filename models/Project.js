const mongoose = require("mongoose");

const ProjectSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        relatedCourse: { type: String, required: true },
        owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        team: [
            { type: mongoose.Schema.Types.ObjectId, ref: 'User'}
        ],
        description: { type: String, required: true },
        minGPA: { type: Number },
        expectedPeople: { type: Number },
        expectedCourses: [ {type: String } ],
        isOpen: {type: Boolean, required: true, default: true},
        applications: [
            { type: mongoose.Schema.Types.ObjectId, ref: 'Application'}
        ],
    }
);

module.exports = mongoose.model("Project", ProjectSchema);