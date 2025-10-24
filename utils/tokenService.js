require('dotenv').config();
const jwt = require('jsonwebtoken');


exports.generateToken=(payload)=>{
    return jwt.sign(playload, process.env.jwtSecret,{ expiresIn: '7d' });
}

exports.verifyToken=(token)=>{
    try{
        return jwt.verify(token, process.env.JWT_SECRET);
    }
    catch (err){
        return null;

    }
}