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

            await User.findByIdAndUpdate(
                req.body.owner,
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
            const updatedProject = await Project.findByIdAndUpdate(
                req.params.id,
                {$set: req.body},
                {new: true}
            );
            const {__v, createdAt, updatedAt, ...updatedProjectInfo} = updatedProject._doc;
            res.status(200).json(updatedProjectInfo);
        } catch (error) {
            res.status(500).json(error);
        }
    },

    // Delete Project func
    deleteProject: async (req, res) => {
        try {
            await Project.findByIdAndDelete(req.params.id)
            res.status(200).json("Project Successfully Deleted");
        } catch (error) {
            res.status(500).json(error);
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
            const project = await Project.find()
            res.status(200).json(project);
        } catch (error) {
            res.status(500).json(error);
        }
    },

    // Turn Post to Project
    postToProject: async (req, res) => {
        try {
            const updatedProject = await Project.findByIdAndUpdate(
                req.params.id,
                {$set: req.body},
                {new: true}
            );

            await User.findByIdAndUpdate(
                updatedProject.owner,
                { $pull: { posts: updatedProject._id } },
                { new: true }
            );

            await User.updateMany(
                { _id: { $in: updatedProject.team } },
                { $push: { projects: updatedProject._id } }
            );

            const {__v, createdAt, updatedAt, ...updatedProjectInfo} = updatedProject._doc;
            res.status(200).json(updatedProjectInfo);
        } catch (error) {
            res.status(500).json(error);
        }
    }

}