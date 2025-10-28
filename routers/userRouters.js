const express =require('express');
const router =express.Router();
const userController =require('../controllers/userController');
const {protectRoute} = require('../middlewares/authMiddleware');

//GET requests
router.get('/login', userController.getLogin);
router.get('/register', userController.getRegister);
router.get('/dashboard',protectRoute, userController.getDashboard);


//POST requests
router.post('/register',userController.registerUser);
router.post('/login', userController.loginUser);
router.post('/update/', protectRoute ,userController.updateUser);
router.post('/logout', protectRoute, userController.logoutUser);

//DELETE requests
router.delete('/delete/', protectRoute, userController.deleteUser);

module.exports = router;
