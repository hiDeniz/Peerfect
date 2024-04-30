const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        surname: { type: String, required: true },
        mail: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        isStudent: { type: Boolean, required: true, default: false },
        isInstructor: { type: Boolean, required: true, default: false },
        verificationCode: { type: String },
        verified: { type: Boolean, default: false }
    },
    { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);