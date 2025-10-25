const User=require('../models/usermodel');
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
exports.loginUser=async (req,res)=>{
    try{
        let {email, password}=req.body;
        const  existingUser = await  User.findOne({email});
        if(!existingUser) {
            return res.render('login', {error: 'Invalid email or password'});
        }

        const isMatch = await bcrypt.compare( password , existingUser.password);
        if(!isMatch){
           return  res.render('login', {error: 'Invalid email or password'});
        }
        
        const token = generateToken({id: existingUser._id});
        res.cookie('token', token,{
            httpOnly:true,
            secure:process.env.NODE_ENV==='production',
            maxAge:7*24*60*60*1000
        });

        return res.redirect('/dashboard');

    }catch(err){
        console.log('Error logging the user.', err.message);
        return res.render('login', {error: 'Server error. Please try again later.'});
    }
}

//User Logout 


//User Delete 


//get user profile 



//Update User