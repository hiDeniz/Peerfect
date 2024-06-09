const User = require("../models/User");
const Project = require("../models/Project");
const CryptoJS = require("crypto-js");

module.exports = {
    // Update function
    updateUser: async (req, res) => {
        if(req.body.password){
            req.body.password = CryptoJS.AES.encrypt(req.body.password, process.env.SECRET).toString();
        }

        try{
            const updatedUser = await User.findByIdAndUpdate(
                req.params.id, {
                    $set: req.body
                }, {new: true}
            );

            const {password, __v, createdAt, ...others} = updatedUser._doc;

            res.status(200).json({...others});
        } catch(error) {
            res.status(500).json(error)
        }
    },

    // Delete function
    deleteUser: async (req, res) => {
        try {
            await User.findByIdAndDelete(req.params.id)
            res.status(200).json("Account Successfully Deleted")
        } catch (error) {
            res.status(500).json(error)
        }
    },

    // Get User function
    getUser: async (req, res) => {
        try {
            const user = await User.findById(req.params.id)
                .populate({
                    path: 'projects',
                    match: { team: { $in: [req.user.id] } },
                    select: '_id relatedCourse title'
                })
                .populate({
                    path: 'posts',
                    match: { team: { $in: [req.user.id] } },
                    select: '_id title expectedPeople relatedCourse minGPA description'
                })
                .populate({
                    path: 'reviews',
                    select: 'rating'
                });
    
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }
    
            const { password, __v, createdAt, updatedAt, ...userData } = user._doc;
    
            // Calculate average rating
            const reviews = user.reviews;
            const totalRating = reviews.reduce((acc, review) => acc + review.rating, 0);
            const averageRating = reviews.length ? (totalRating / reviews.length).toFixed(2) : 0;
    
            const response = {
                _id: userData._id,
                name: userData.name,
                surname: userData.surname,
                degree: userData.degree,
                gpa: userData.gpa,
                imageUrl: userData.imageUrl,
                schoolID: userData.schoolID,
                term: userData.term,
                university: userData.university,
                projects: userData.projects,
                posts: userData.posts,
                completedCourses: userData.completedCourses,
                averageRating: parseFloat(averageRating)
            };
    
            res.status(200).json(response);
        } catch (error) {
            res.status(500).json(error);
        }
    },

    // Get All User function
    getAllUsers: async (req, res) => {
        try {
            const allUser = await User.find();

            res.status(200).json(allUser)
        } catch (error) {
            res.status(500).json(error)
        }
    },

    // Get Posts of User
    getUserPost: async (req, res) => {
        try {
            const user = await User.findById(req.params.id)
                .populate({
                    path: 'posts',
                    match: { 
                        team: { $in: [req.user.id] }, // Ensure the requester is in the team
                        isOpen: true // Only include posts that are open
                    },
                    select: '_id title expectedPeople relatedCourse minGPA description'
                });

            res.status(200).json(user.posts);
        } catch (error) {
            res.status(500).json(error);
        }
    },

    // Get Reviews of User
    getUserReview: async (req, res) => {
        try {
            const user = await User.findById(req.params.id)
                .populate({
                    path: 'reviews',
                    populate: {
                        path: 'owner',
                        select: 'name surname'
                    },
                    select: '_id owner comment rating'
                });
    
            const reviews = user.reviews.map(review => ({
                _id: review._id,
                owner: {
                    name: review.owner.name,
                    surname: review.owner.surname
                },
                comment: review.comment,
                rating: review.rating
            }));
    
            res.status(200).json(reviews);
        } catch (error) {
            res.status(500).json(error);
        }
    },

    // Get User Home Page function
    getUserHomePage: async (req, res) => {
        try {
            const user = await User.findById(req.params.id);

            // Check if the user has a GPA
            if (user.gpa == null) {
                return res.status(400).json({ message: "Please update your profile to include your GPA to see projects." });
            }

            const { gpa, completedCourses } = user;

            const projects = await Project.find({
                minGPA: { $lte: gpa },
                $or: [
                    { expectedCourses: { $exists: false } },
                    { expectedCourses: { $elemMatch: { $in: Array.from(completedCourses.keys()) } } }
                ],
                isOpen: true,
                team: { $ne: user.id },
                team: { $ne: [] },
                owner: { $ne: user.id }
            }).select('_id title expectedPeople relatedCourse minGPA description');

            res.status(200).json(projects);
        } catch (error) {
            res.status(500).json(error);
        }
    },
}