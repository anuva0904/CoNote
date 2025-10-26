const {verifyToken}=require('../utils/tokenService');
const User = require('../models/usermodel');

exports.protectRoute = async (req,res)=>{
    try{
        const token = req.cookies.token;
        if(!token){
            return res.redirect('/login');
        }

        const decode =verifyToken(token);
        if(!decode){
            res.clearCookie('token');
            return res.redirect('/login');
        }

        const user =await User.findById(decoded.id).select('-password');
        if(!user){
            res.clearCookie('token');
            return res.redirect('/login');
        }

        req.user = user;
        next();
    }catch(err){
        console.log('Auth middleware error', err.message);
        res.clearCookie('token');
        return res.redirect('/login');
    }
}