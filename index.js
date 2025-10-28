//Global modules
const express =require('express');
const mongoose=require('mongoose');
const cookieParser = require('cookie-parser');
const path =require('path');
require('dotenv').config();

//Local modules
const db=require('./config/dbconnection');
const userRoutes = require('./routers/userRouters');
const notesRoutes = require('./routers/notesRouter');
const folderRoutes = require('./routers/folderRouter');
const commentRoutes = require('./routers/commentsRouter');

//Initializing app
const app=express();

//Setting up db connection
db();

//Middleware
app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//Setting view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Routes
app.use('/users', userRoutes);
app.use('/notes', notesRoutes);
app.use('/folders', folderRoutes);
app.use('/comments', commentRoutes);

// 404 handler
app.use((req, res) => {
    res.status(404).render('404', { message: 'Page not found' });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('500', { message: 'Something went wrong!' });
});

const port=process.env.PORT || 3000;
app.listen(port,()=>{
    console.log(`Server is running on port ${port}`);
});