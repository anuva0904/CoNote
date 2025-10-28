const express =require('express');
const router =express.Router();
const notesController =require('../controllers/notesController');
const {protectRoute} = require('../middlewares/authMiddleware');


//GET requests
router.get('/notes', protectRoute, notesController.getNotes);
router.get('/notes/:id', protectRoute, notesController.getNoteById);

//POST requests
router.post('/folders/:id/notes', protectRoute, notesController.createNote);
router.post('/notes/duplicate/:id', protectRoute, notesController.duplicateNote);

//PUT request
router.put('/notes/update/:id', protectRoute, notesController.updateNote);
router.put('/notes/:id/autosave', notesController.autoSaveNote);

//DELETE requests
router.delete('/notes/delete/:id', protectRoute, notesController.deleteNote);


module.exports = router;
