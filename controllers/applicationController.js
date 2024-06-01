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
    },

    // Update Application func
    updateApplication: async (req, res) => {
        try {
            const updatedApplication = await Application.findByIdAndUpdate(
                req.params.id,
                {$set: req.body},
                {new: true}
            );
            const {__v, createdAt, updatedAt, ...updatedApplicationInfo} = updatedApplication._doc;
            res.status(200).json(updatedApplicationInfo);
        } catch (error) {
            res.status(500).json(error);
        }
    },

    // Delete Application func
    deleteApplication: async (req, res) => {
        try {
            await Application.findByIdAndDelete(req.params.id)
            res.status(200).json("Application Successfully Deleted");
        } catch (error) {
            res.status(500).json(error);
        }
    },

    // Get Application func
    getApplication: async (req, res) => {
        try {
            const application = await Application.findById(req.params.id)
                .populate({
                    path: 'owner',
                    select: '_id name surname imageUrl'
                });

            res.status(200).json(application);
        } catch (error) {
            res.status(500).json(error);
        }
    },

    // Get All Application func
    getAllApplications: async (req, res) => {
        try {
            const application = await Application.find()
            res.status(200).json(application);
        } catch (error) {
            res.status(500).json(error);
        }
    },
}