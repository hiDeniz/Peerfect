const Project = require("../models/Project");
const User = require("../models/User");

module.exports = {
    // Create Project function
    createProject: async (req, res) => {

        try{
            const team = req.body.team ? [...new Set([req.body.owner, ...req.body.team])] : [req.body.owner];
            const newProject = new Project({
                ...req.body,
                team: team
            });

            const savedProject = await newProject.save();

            await User.updateMany(
                { _id: { $in: team } },
                { $push: { posts: savedProject._id } },
                { new: true }
            );
            
            const {__v, createdAt, updatedAt, ...newProjectInfo} = savedProject._doc; 

            res.status(201).json(newProjectInfo);

        } catch (error){
            res.status(500).json(error);
        }
    },

    // Update Project func
    updateProject: async (req, res) => {
        try {
            // Retrieve the project before the update
            const projectBeforeUpdate = await Project.findById(req.params.id);
            if (!projectBeforeUpdate) {
                return res.status(404).json({ message: "Project not found" });
            }
            const initialTeamSize = projectBeforeUpdate.team.length;

            // Perform the update
            const updatedProject = await Project.findByIdAndUpdate(
                req.params.id,
                { $set: req.body },
                { new: true }
            );

            // Retrieve the updated project to get the new team size
            const newTeamSize = updatedProject.team.length;

            // Compare the sizes of the team array before and after the update
            if (newTeamSize < initialTeamSize) {
                // Update the expectedPeople count
                updatedProject.expectedPeople -= (initialTeamSize - newTeamSize);
                await updatedProject.save();
            }

            const { __v, createdAt, updatedAt, ...updatedProjectInfo } = updatedProject._doc;
            res.status(200).json(updatedProjectInfo);
        } catch (error) {
            res.status(500).json(error);
        }
    },

    // Delete Project function
    deleteProject: async (req, res) => {
        try {
            const project = await Project.findById(req.params.id);
            if (!project) {
                return res.status(404).json({ message: "Project not found" });
            }

            // Remove the project ID from users' posts or projects array
            if (project.isOpen) {
                await User.updateMany(
                    { posts: project._id },
                    { $pull: { posts: project._id } }
                );
            } else {
                await User.updateMany(
                    { projects: project._id },
                    { $pull: { projects: project._id } }
                );
            }

            // Delete the project
            await Project.findByIdAndDelete(req.params.id);

            res.status(200).json({ message: "Project successfully deleted" });
        } catch (error) {
            console.error(error); // Log the error for debugging purposes
            res.status(500).json({ message: "Internal server error", error: error.message });
        }
    },

    // Get Project func
    getProject: async (req, res) => {
        try {
            const project = await Project.findById(req.params.id)
                .populate({
                    path: 'team',
                    select: '_id name surname imageUrl'
                });

            res.status(200).json(project);
        } catch (error) {
            res.status(500).json(error);
        }
    },

    // Get All Project func
    getAllProjects: async (req, res) => {
        try {
            const projects = await Project.find({
                team: { $ne: [] } // Ensure the team array is not empty
            }).select('_id title expectedPeople relatedCourse minGPA description');

            res.status(200).json(projects);
        } catch (error) {
            res.status(500).json(error);
        }
    },

    // Turn Post to Project / Project to Post function
    postToProject: async (req, res) => {
        try {
            const { isOpen } = req.body;

            // Update the project with the new isOpen value
            const updatedProject = await Project.findByIdAndUpdate(
                req.params.id,
                { $set: req.body },
                { new: true }
            );

            if (isOpen) {
                // Turn project to post
                await User.updateMany(
                    { _id: { $in: updatedProject.team } },
                    { $pull: { projects: updatedProject._id } }
                );

                await User.updateMany(
                    { _id: { $in: updatedProject.team } },
                    { $push: { posts: updatedProject._id } }
                );
            } else {
                // Turn post to project
                await User.updateMany(
                    { _id: { $in: updatedProject.team } },
                    { $pull: { posts: updatedProject._id } }
                );

                await User.updateMany(
                    { _id: { $in: updatedProject.team } },
                    { $push: { projects: updatedProject._id } }
                );
            }

            const { __v, createdAt, updatedAt, ...updatedProjectInfo } = updatedProject._doc;
            res.status(200).json(updatedProjectInfo);
        } catch (error) {
            res.status(500).json(error);
        }
    },

    // Join Project Team function
    joinProject: async (req, res) => {
        try {
            const projectId = req.params.id;
            const userId = req.user.id;

            const project = await Project.findById(projectId);
            if (!project) {
                return res.status(404).json({ message: "Project not found" });
            }

            if (project.team.includes(userId)) {
                return res.status(400).json({ message: "User is already in the team" });
            }

            project.team.push(userId);
            project.expectedPeople = Math.max(project.expectedPeople - 1, 0);

            await project.save();

            await User.findByIdAndUpdate(
                userId,
                { $push: { posts: projectId } },
                { new: true }
            );

            if (project.expectedPeople === 0) {
                // Create a request object for postToProject
                const postToProjectReq = {
                    params: { id: projectId },
                    body: { isOpen: false },
                    user: req.user
                };

                // Create a response object to capture the response from postToProject
                const postToProjectRes = {
                    status: (statusCode) => ({
                        json: (responseBody) => {
                            res.status(statusCode).json({
                                message: "User added to the project team and project closed",
                                project: responseBody
                            });
                        }
                    }),
                    statusCode: 200,
                    json: (responseBody) => {
                        res.status(200).json({
                            message: "User added to the project team and project closed",
                            project: responseBody
                        });
                    }
                };

                // Call postToProject function
                await module.exports.postToProject(postToProjectReq, postToProjectRes);
            } else {
                res.status(200).json({ message: "User added to the project team", project });
            }
        } catch (error) {
            res.status(500).json(error);
        }
    },

}