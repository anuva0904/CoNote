const express =require('express');
const router =express.Router();
const folderController =require('../controllers/foldersControllers');
const {protectRoute} = require('../middlewares/authMiddleware');


//GET requests
router.get('/folders', protectRoute, folderController.getFolder);
router.get('/folders/:id', protectRoute, folderController.getFolderById);

//POST requests
router.post('/folders', protectRoute, folderController.createFolder);
router.post('/folders/:id/update', protectRoute, folderController.updateFolder);

//DELETE requests
router.delete('/deletefolder/:id', protectRoute, folderController.deleteFolder);


module.exports = router;