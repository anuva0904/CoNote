require('dotenv').config();
const jwt = require('jsonwebtoken');


exports.generateToken=(payload)=>{
    return jwt.sign(payload, process.env.jwtSecret,{ expiresIn: '7d' });
}

exports.verifyToken=(token)=>{
    try{
        return jwt.verify(token, process.env.jwtSecret);
    }
    catch (err){
        return null;

    }
}