const User=require('./models/usermodel');
const {generateToken} =require('../utils/tokenService');
const bcrypt=require('bcrypt');
require('dotenv').config();


//User Registration 
exports.registerUser=async(req,res)=>{
    const {username,email,password,role,profilePic}=req.body;
    try{
        if(!username || !email || !password){
            return res.status(400).json({message:'please provide all required fields'});
        }

        const existingUser=await User.findOne({email});
        if(existingUser){
            return res.status(400).json({message:'User already exists'});
        }

        const hashedPassword = await bcrypt.hash(password,10);

        const newUser = new User({
            name: username,
            email,
            password: hashedPassword,
            role,
            profilePic
        });


        await newUser.save();

        const jwttoken= generateToken({id: newUser._id});
        res.cookie('token',jwttoken,{httpOnly:true,secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict', maxAge:7*24*60*60*1000});

        

        return res.redirect('/login');

    }catch(err){
        console.error('Error registering user:', err.message);
        return res.render('register', {error: 'Server error. Please try again later.'});
    }
}

//User Login 




//User Logout 


//User Delete 


//get user profile 



//Update User