const mongoose = require("mongoose");

async function createProjectSchema() {
    const { customAlphabet } = await import('nanoid');
    const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 6);

    const ProjectSchema = new mongoose.Schema(
        {
            _id: { type: String, default: () => nanoid() },
            title: { type: String, required: true },
            relatedCourse: { type: String, required: true },
            owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
            team: [
                { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
            ],
            description: { type: String, required: true },
            minGPA: { type: Number },
            expectedPeople: { type: Number },
            expectedCourses: [{ type: String }],
            isOpen: { type: Boolean, required: true, default: true },
            applications: [
                { type: mongoose.Schema.Types.ObjectId, ref: 'Application' }
            ]
        },
        { _id: false } // This prevents Mongoose from creating the default `_id` field
    );

    return mongoose.model("Project", ProjectSchema);
}

module.exports = createProjectSchema().then(Project => Project);