const User = require("../models/User");
const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const authHeader = req.headers.token;

    if(authHeader){
        const token = authHeader.split(" ")[1];

        jwt.verify(token, process.env.SECRET, async (err, user) => {
            if(err) res.status(403).json('Invalid token!');

            req.user = user;

            next();
        })
    } else {
        return res.status(401).json('You are not authenticated!');
    }
};

const verifyAndAuthorization = (req, res, next) => {
    verifyToken(req, res, () =>{
        if(req.user.id === req.params.id || req.user.isAdmin){
            next();
        } else {
            res.status(403).json("You are restricted from performing this operation!");
        }
    });
};

const verifyAndOtherAuthorization = async (req, res, next) => {
    verifyToken(req, res, async () => {
        try {
            const user = await User.findById(req.user.id);
            if (user) {
                next();
            } else {
                res.status(403).json("You are restricted from performing this operation!");
            }
        } catch (err) {
            res.status(500).json(err);
        }
    });
};

const verifyAndAdmin = (req, res, next) => {
    verifyToken(req, res, () => {
        if (req.user.isAdmin) {
            next();
        } else {
            res.status(403).json("You have limited access!");
        }
    });
};

module.exports = {verifyToken, verifyAndAuthorization, verifyAndAdmin, verifyAndOtherAuthorization};