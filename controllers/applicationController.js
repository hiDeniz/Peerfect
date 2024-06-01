const Application = require("../models/Application");
const Project = require("../models/Project");
const User = require("../models/User");

module.exports = {
    // Create Application function
    createApplication: async (req, res) => {
        try {
            const { owner, applicationTo, status } = req.body;

            const newApplication = new Application({
                owner,
                applicationTo,
                status
            });

            const savedApplication = await newApplication.save();

            await User.findByIdAndUpdate(
                owner,
                { $push: { myApplications: savedApplication._id } },
                { new: true }
            );

            await Project.findByIdAndUpdate(
                applicationTo,
                { $push: { applications: savedApplication._id } },
                { new: true }
            );

            res.status(201).json(savedApplication);

        } catch (error) {
            res.status(500).json(error);
        }
    }
}