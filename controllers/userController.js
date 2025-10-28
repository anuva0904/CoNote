const User=require('../models/usermodel');
const Folder = require('../models/foldermodel');
const Notes = require('../models/notesmodel');
const {generateToken} =require('../utils/tokenService');
const {verifyemail}=require('../utils/emailVerfication');
const bcrypt=require('bcrypt');
require('dotenv').config();

//get login

exports.getLogin=(req,res)=>{
    return res.status(200).render('login');
}

//get register

exports.getRegister=(req,res)=>{
    return res.status(200).render('register');
}


//get dashboard 
exports.getDashboard=(req,res)=>{
    try{
        const user=req.user;
        if (!user) return res.status(401).redirect('/login');

        return res.status(200).render('dashboard', { user });
    } catch (err) {
        console.error('Error fetching dashboard:', err.message);
        return res.status(500).render('dashboard', { error: 'Could not load dashboard. Try again later.' });
    }
}


//User Registration 
exports.registerUser=async(req,res)=>{
    const {username,email,password,role,profilePic}=req.body;
    try{
        if(!username || !email || !password){
            return res.status(400).render('register', { error: 'Please provide all required fields' });
        }

        if (!verifyemail(email)) {
            return res.status(400).render('register', { error: 'Invalid email format' });
        }

        const existingUser=await User.findOne({email});
        if(existingUser){
            return res.status(400).render('register', { error: 'User already exists. Go to Login Page' });
        }

        const hashedPassword = await bcrypt.hash(password,10);

        const newUser = new User({
            name: username.trim(),
            email:email.trim(),
            password: hashedPassword,
            role,
            profilePic
        });


        await newUser.save();

        const jwttoken= generateToken({id: newUser._id});
        res.cookie('token',jwttoken,{httpOnly:true,secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict', maxAge:7*24*60*60*1000});
        return res.status(201).redirect('/login');

    }catch(err){
        console.error('Error registering user:', err.message);
        return res.status(500).render('register', {error: 'Server error. Please try again later.'});
    }
}

//User Login 
exports.loginUser=async (req,res)=>{
    try{
        let {email, password}=req.body;
        const  existingUser = await  User.findOne({email});
        if(!existingUser) {
            return res.status(400).render('login', {error: 'Invalid email or password'});
        }

        const isMatch = await bcrypt.compare( password , existingUser.password);
        if(!isMatch){
           return  res.status(400).render('login', {error: 'Invalid email or password'});
        }
        
        const token = generateToken({id: existingUser._id});
        res.cookie('token', token,{
            httpOnly:true,
            secure:process.env.NODE_ENV==='production',
            maxAge:7*24*60*60*1000
        });

        return res.status(200).redirect('/dashboard');

    }catch(err){
        console.error('Error logging the user.', err.message);
        return res.status(500).render('login', {error: 'Server error. Please try again later.'});
    }
}

//User Logout 
exports.logoutUser=(req,res)=>{
    res.clearCookie('token',{
         httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    })
    return res.status(200).redirect('/login');
}

//User Delete 
exports.deleteUser=async(req,res)=>{
    try{
        const user =req.user;
        if(!user){
            return res.status(401).redirect('/login');
        }

        await Notes.deleteMany({ owner: user._id });

        await Folder.deleteMany({ owner: user._id });

        await User.findByIdAndDelete(user._id);

        res.clearCookie('token', {
            httpOnly: true,
            secure:process.env.NODE_ENV==='production',
            sameSite:'strict'
        })

        return res.status(200).redirect('/login');
    }catch(err){

        console.error('Error deleting the user', err.message);
        return res.status(500).render('dashboard',{error :'Could not delete the account. Try again later.'});
    }
}
//Update User
exports.updateUser=async (req,res)=>{
    try{
        const userID=req.user._id;
        const {username, email, password, profilePic}=req.body;
        const updates={};
        if(username && username.trim()!=='') updates.name=username.trim();
        if(email && email.trim()!=='') {
            if (!verifyemail(email)) {
            return res.status(400).render('dashboard', { error: 'Invalid email format' });
        }
            updates.email=email.trim();}
        if(password && password.trim()!=='') {
            const hashedPassword = await bcrypt.hash(password,10);
            updates.password=hashedPassword;
        } 
        if (profilePic && profilePic.trim() !== '') updates.profilePic = profilePic.trim();
        const updatedUser = await User.findByIdAndUpdate(
            userID,
            {$set:updates},
            { new: true, runValidators: true }
        ).select('-password');

        if (!updatedUser) {
        return res.status(404).render('dashboard', { error: 'User not found.' });
        }

        return res.render('dashboard', {
      user: updatedUser,
      message: 'Profile updated successfully!',
    });
            
    }catch(err){
        console.error('Error updating user:', err.message);
    return res.status(500).render('dashboard', { error: 'Failed to update profile. Try again later.' });
  }
}


