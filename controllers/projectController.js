const Project = require("../models/Project");

module.exports = {
    // Create Project function
    createProject: async (req, res) => {
        const newProject = new Project(req.body);

        try{
            const savedProject = await newProject.save();
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
    }

}