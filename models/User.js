const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        surname: { type: String, required: true },
        mail: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        isAdmin: { type: Boolean, default: false },
        verificationCode: { type: String },
        verified: { type: Boolean, default: false },
        university: { type: String },
        degree: { type: String },
        term: { type: String },
        schoolID: { type: Number},
        gpa: { type:Number },
        completedCourses: { type: Map, of: String },
        projects: [
            { type: mongoose.Schema.Types.ObjectId, ref: 'Project' }
        ],
        posts: [
            { type: mongoose.Schema.Types.ObjectId, ref: 'Project' }
        ],
        reviews: [
            { type: mongoose.Schema.Types.ObjectId, ref: 'Review'}
        ],
        imageUrl: { type: String } //düzenlenecek!!!
    },
    { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);