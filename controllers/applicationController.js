const Application = require("../models/Application");
const Project = require("../models/Project");
const User = require("../models/User");
const projectController = require("./projectController");

module.exports = {
    // Create Application function
    createApplication: async (req, res) => {
        try {
            const { owner, applicationTo, status } = req.body;
    
            // Check if the user already has an application for the same project
            const existingApplication = await Application.findOne({ owner, applicationTo });
            if (existingApplication) {
                return res.status(400).json({ message: "You have already applied to this project!" });
            }
    
            const project = await Project.findById(applicationTo);
            if (project.team.includes(owner)) {
                return res.status(400).json({ message: "You are already a member of the project!" });
            }
    
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
            const projectUpdate = await Project.findByIdAndUpdate(
                application.applicationTo,
                { $pull: { applications: application._id } },
                { new: true }
            );
            if (!projectUpdate) {
                return res.status(404).json({ message: "Project not found" });
            }

            // Remove the application ID from the user's myApplications array
            const userUpdate = await User.findByIdAndUpdate(
                application.owner,
                { $pull: { myApplications: application._id } },
                { new: true }
            );
            if (!userUpdate) {
                return res.status(404).json({ message: "User not found" });
            }

            // Delete the application
            await Application.findByIdAndDelete(req.params.id);

            res.status(200).json({ message: "Application successfully deleted" });
        } catch (error) {
            console.error(error); // Log the error for debugging purposes
            res.status(500).json({ message: "Internal server error", error: error.message });
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
            const myApplications = await Application.find({ owner: userId })
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
    
            // Find all applications made to the user's posts or where the user is in the team
            const projectApplications = await Application.find({ 
                applicationTo: { $in: postIds },
                status: 'PENDING'
            })
                .populate({
                    path: 'applicationTo',
                    select: 'title description owner team'
                })
                .populate({
                    path: 'owner',
                    select: '_id name surname imageUrl'
                });
    
            // Filter applications where the user is either the owner or a team member of the project
            const filteredProjectApplications = projectApplications.filter(app => {
                const project = app.applicationTo;
                return project.owner.equals(userId) || project.team.includes(userId);
            });
    
            // Format the response
            const formatOwner = (owner) => ({
                _id: owner._id,
                fullName: `${owner.name} ${owner.surname}`,
                imageUrl: owner.imageUrl
            });
    
            const formattedMyApplications = myApplications.map(app => ({
                ...app._doc,
                owner: formatOwner(app.owner)
            }));
    
            const formattedProjectApplications = filteredProjectApplications.map(app => ({
                ...app._doc,
                owner: formatOwner(app.owner)
            }));
    
            res.status(200).json({ myApplications: formattedMyApplications, projectApplications: formattedProjectApplications });
        } catch (error) {
            res.status(500).json(error);
        }
    }    
}