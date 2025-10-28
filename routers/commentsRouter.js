const express =require('express');
const router =express.Router();
const CommentsController =require('../controllers/commentsController');
const {protectRoute} = require('../middlewares/authMiddleware');

//GET
router.get('/notes/:noteId/comments', protectRoute, CommentsController.getCommentsByNote);
//POST
router.post('/notes/:noteId/comments', protectRoute, CommentsController.addComment);
router.post('/comments/:commentId/replies', protectRoute, CommentsController.addReply);


//Delete
router.delete('/comments/:commentId', protectRoute, CommentsController.deleteComment);
router.delete('/comments/:commentId/replies/:replyId', protectRoute, CommentsController.deleteReply);

module.exports = router;