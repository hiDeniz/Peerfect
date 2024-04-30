const User = require("../models/User");
const CryptoJS = require("crypto-js");
const jwt = require('jsonwebtoken');
const { sendEmail } = require('../utils/mailer');

// Function to generate a random verification code
const generateVerificationCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

module.exports = {
    // Registration function
    createUser: async (req, res) => {
        const verificationCode = generateVerificationCode();
        const newUser = new User({
            name: req.body.name,
            surname: req.body.surname,
            mail: req.body.mail,
            password: CryptoJS.AES.encrypt(req.body.password, process.env.SECRET).toString(),
            isStudent: req.body.isStudent,
            isInstructor: req.body.isInstructor,
            verificationCode: verificationCode,
            verified: false
        });

        try {
            const savedUser = await newUser.save();
            await sendEmail(req.body.mail, "Verify Your Email", `Your verification code is: ${verificationCode}`);
            res.status(201).json({ message: "User registered, please check your email to verify your account.", userId: savedUser._id });
        } catch (error) {
            res.status(500).json(error);
        }
    },

    // Login function
    loginUser: async (req, res) => {
        try {
            const user = await User.findOne({ mail: req.body.mail });
            if (!user) {
                return res.status(401).json("Wrong Login Details");
            }

            if (!user.verified) {
                return res.status(401).json("Please verify your email address first.");
            }

            const decryptedPass = CryptoJS.AES.decrypt(user.password, process.env.SECRET);
            const originalPassword = decryptedPass.toString(CryptoJS.enc.Utf8);

            if (originalPassword !== req.body.password) {
                return res.status(401).json("Wrong Password");
            }

            const accessToken = jwt.sign(
                { id: user._id, isAdmin: user.isInstructor },
                process.env.SECRET,
                { expiresIn: '21d' }
            );

            const { password, __v, createdAt, verificationCode, ...others } = user._doc;
            res.status(200).json({ ...others, accessToken });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Internal Server Error" });
        }
    },

    // Email verification function
    verifyEmail: async (req, res) => {
        try {
            const user = await User.findOne({ _id: req.body.userId });
            if (!user) return res.status(404).json("User not found");

            if (user.verificationCode === req.body.code) {
                user.verified = true;
                await user.save();
                res.status(200).json("Email verified successfully");
            } else {
                res.status(400).json("Invalid verification code");
            }
        } catch (error) {
            res.status(500).json(error);
        }
    },

    // Simple home endpoint for tests
    homeUser: async (req, res) => {
        try {
            res.send('Hello World!');
        } catch (error) {
            res.status(500).json(error);
        }
    }
};