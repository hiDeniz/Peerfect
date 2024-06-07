const Application = require("../models/Application");
const Project = require("../models/Project");
const User = require("../models/User");
const projectController = require("./projectController");

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
                { $set: req.body },
                { new: true }
            );
            const { __v, createdAt, updatedAt, ...updatedApplicationInfo } = updatedApplication._doc;

            // If the application status is "ACCEPTED", call joinProject
            if (updatedApplicationInfo.status === "ACCEPTED") {
                const projectId = updatedApplicationInfo.applicationTo;
                const userId = updatedApplicationInfo.owner;

                // Create a request object for joinProject
                const joinProjectReq = {
                    params: { id: projectId },
                    user: { id: userId }
                };

                // Create a response object to capture the response from joinProject
                const joinProjectRes = {
                    status: (statusCode) => ({
                        json: (responseBody) => {
                            res.status(statusCode).json({
                                message: "Application updated and user added to the project team",
                                application: updatedApplicationInfo,
                                project: responseBody.project
                            });
                        }
                    }),
                    statusCode: 200,
                    json: (responseBody) => {
                        res.status(200).json({
                            message: "Application updated and user added to the project team",
                            application: updatedApplicationInfo,
                            project: responseBody.project
                        });
                    }
                };

                // Call joinProject function
                await projectController.joinProject(joinProjectReq, joinProjectRes);
            } else {
                res.status(200).json(updatedApplicationInfo);
            }
        } catch (error) {
            res.status(500).json(error);
        }
    },

    // Delete Application function
    deleteApplication: async (req, res) => {
        try {
            const application = await Application.findById(req.params.id);
            if (!application) {
                return res.status(404).json({ message: "Application not found" });
            }

            // Remove the application ID from the project's applications array
            await Project.findByIdAndUpdate(
                application.applicationTo,
                { $pull: { applications: application._id } }
            );

            // Delete the application
            await application.remove();

            res.status(200).json({ message: "Application successfully deleted" });
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

    // Get All Applications for a User and User's Posts
    getAllApplicationsForUser: async (req, res) => {
        try {
            const userId = req.params.id;

            // Find applications owned by the user
            let myApplications = await Application.find({ owner: userId })
                .populate({
                    path: 'applicationTo',
                    select: 'title description'
                })
                .populate({
                    path: 'owner',
                    select: '_id name surname imageUrl'
                });

            // Find the user's posts
            const user = await User.findById(userId).populate('posts');
            const postIds = user.posts.map(post => post._id);

            // Find all applications made to the user's posts
            let projectApplications = await Application.find({ applicationTo: { $in: postIds } })
                .populate({
                    path: 'applicationTo',
                    select: 'title description'
                })
                .populate({
                    path: 'owner',
                    select: '_id name surname imageUrl'
                });

            // Transform myApplications to combine name and surname
            myApplications = myApplications.map(application => {
                const { name, surname, ...ownerRest } = application.owner;
                const ownerFullName = `${name} ${surname}`;
                return {
                    ...application._doc,
                    owner: {
                        ...ownerRest,
                        fullName: ownerFullName
                    }
                };
            });

            // Transform projectApplications to combine name and surname
            projectApplications = projectApplications.map(application => {
                const { name, surname, ...ownerRest } = application.owner;
                const ownerFullName = `${name} ${surname}`;
                return {
                    ...application._doc,
                    owner: {
                        ...ownerRest,
                        fullName: ownerFullName
                    }
                };
            });

            res.status(200).json({ myApplications, projectApplications });
        } catch (error) {
            res.status(500).json(error);
        }
    },
}