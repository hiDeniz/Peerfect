const User = require("../models/User");
const CryptoJS = require("crypto-js");
const jwt = require('jsonwebtoken');

module.exports = {
    //Register func
    createUser: async (req, res) => {
        console.log('endpoint hit');
        const newUser = new User({
            name: req.body.name,
            surname: req.body.surname,
            mail: req.body.mail,
            password: CryptoJS.AES.encrypt(req.body.password, process.env.SECRET).toString(),
            isStudent: req.body.isStudent,
            isInstructor:req.body.isInstructor
        });

        try{
            const savedUser = await newUser.save();
            res.status(201).json(savedUser);
        } catch(error) {
            res.status(500).json(error);
        }
    },

    //Login func
    loginUser: async (req, res) => {
        try {
            const user = await User.findOne({ mail: req.body.mail });
            if (!user) {
                return res.status(401).json("Wrong Login Details");
            }
    
            const decryptedPass = CryptoJS.AES.decrypt(user.password, process.env.SECRET || 'default_secret_key');
            const originalPassword = decryptedPass.toString(CryptoJS.enc.Utf8);
    
            if (originalPassword !== req.body.password) {
                return res.status(401).json("Wrong Password");
            }
    
            const userToken = jwt.sign(
                {
                    id: user._id,
                },
                process.env.JWT_SEC || 'default_jwt_secret',
                { expiresIn: '21d' }
            );
    
            const { password, __v, createdAt, ...others } = user._doc;
            res.status(200).json({ ...others, userToken });
        } catch (error) {
            console.error(error); // It's a good practice to log the error for debugging.
            return res.status(500).json({ message: "Internal Server Error" });
        }
    }
    
}