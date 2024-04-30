const User = require("../models/User");
const CryptoJS = require("crypto-js");

module.exports = {
    // Update function
    updateUser: async (req, res) => {
        if(req.body.password){
            req.body.password = CryptoJS.AES.encrypt(req.body.password, process.env.SECRET).toString();
        }

        try{
            const updateUser = await User.findByIdAndUpdate(
                req.params.id, {
                    $set: req.body
                }, {new: true}
            );

            const {password, __v, createdAt, ...others} = updateUser._doc;

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

}