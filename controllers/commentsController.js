const Comment = require('../models/commentmodel');
const Note = require('../models/notesmodel');


//Get all comments for the notes

exports.getCommentsByNote = async (req, res) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).redirect('/login');

    const { noteId } = req.params;

    const note = await Note.findOne({ _id: noteId, owner: user._id });
    if (!note) {
      return res.status(404).render('note', {
        user,
        note: null,
        comments: [],
        error: 'Note not found or access denied.'
      });
    }

    const comments = await Comment.find({ note: noteId })
      .populate('user', 'name email')
      .populate('replies.author', 'name email')
      .sort({ createdAt: -1 });

    return res.status(200).render('note', { user, note, comments, error: null });
  } catch (err) {
    console.error('Error fetching comments:', err.message);
    return res.status(500).render('note', {
      user: req.user || null,
      note: null,
      comments: [],
      error: 'Failed to load comments.'
    });
  }
};

//Add a new comment to a note
 
exports.addComment = async (req, res) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).redirect('/login');

    const { noteId } = req.params;
    const { commentText } = req.body;

    const note = await Note.findOne({ _id: noteId, owner: user._id }).populate('folder');
    if (!note) {
      return res.status(404).render('note', {
        user,
        note: null,
        comments: [],
        error: 'Note not found or access denied.'
      });
    }

    if (!commentText || commentText.trim() === '') {
      const comments = await Comment.find({ note: noteId }).populate('user').populate('replies.author');
      return res.status(400).render('note', {
        user,
        note,
        comments,
        error: 'Comment cannot be empty.'
      });
    }

    const newComment = new Comment({
      commentText: commentText.trim(),
      note: note._id,
      user: user._id
    });

    await newComment.save();

    // Redirect back to note page after posting
    return res.redirect(`/notes/${note._id}`);
  } catch (err) {
    console.error('Error adding comment:', err.message);
    return res.status(500).render('note', {
      user: req.user || null,
      note: null,
      comments: [],
      error: 'Failed to add comment.'
    });
  }
};

//Add a reply to an existing comment
 
exports.addReply = async (req, res) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).redirect('/login');

    const { commentId } = req.params;
    const { content } = req.body;

    const comment = await Comment.findById(commentId).populate('note');
    if (!comment) {
      return res.status(404).render('note', {
        user,
        note: null,
        comments: [],
        error: 'Comment not found.'
      });
    }

    if (!content || content.trim() === '') {
      const comments = await Comment.find({ note: comment.note._id }).populate('user').populate('replies.author');
      return res.status(400).render('note', {
        user,
        note: comment.note,
        comments,
        error: 'Reply cannot be empty.'
      });
    }

    comment.replies.push({
      author: user._id,
      content: content.trim()
    });

    await comment.save();

    return res.redirect(`/notes/${comment.note._id}`);
  } catch (err) {
    console.error('Error adding reply:', err.message);
    return res.status(500).render('note', {
      user: req.user || null,
      note: null,
      comments: [],
      error: 'Failed to add reply.'
    });
  }
};

// Delete a comment
 
exports.deleteComment = async (req, res) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).redirect('/login');

    const { commentId } = req.params;

    const comment = await Comment.findById(commentId).populate('note');
    if (!comment) {
      return res.status(404).render('note', {
        user,
        note: null,
        comments: [],
        error: 'Comment not found.'
      });
    }

    const note = await Note.findById(comment.note);
    if (!comment.user.equals(user._id) && !note.owner.equals(user._id)) {
      const comments = await Comment.find({ note: note._id }).populate('user').populate('replies.author');
      return res.status(403).render('note', {
        user,
        note,
        comments,
        error: 'Not authorized to delete this comment.'
      });
    }

    await Comment.findByIdAndDelete(commentId);

    return res.redirect(`/notes/${note._id}`);
  } catch (err) {
    console.error('Error deleting comment:', err.message);
    return res.status(500).render('note', {
      user: req.user || null,
      note: null,
      comments: [],
      error: 'Failed to delete comment.'
    });
  }
};

// Delete a reply
 
exports.deleteReply = async (req, res) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).redirect('/login');

    const { commentId, replyId } = req.params;

    const comment = await Comment.findById(commentId).populate('note');
    if (!comment) {
      return res.status(404).render('note', {
        user,
        note: null,
        comments: [],
        error: 'Comment not found.'
      });
    }

    const reply = comment.replies.id(replyId);
    if (!reply) {
      const comments = await Comment.find({ note: comment.note._id }).populate('user').populate('replies.author');
      return res.status(404).render('note', {
        user,
        note: comment.note,
        comments,
        error: 'Reply not found.'
      });
    }

    const note = await Note.findById(comment.note);
    if (!reply.author.equals(user._id) && !note.owner.equals(user._id)) {
      const comments = await Comment.find({ note: note._id }).populate('user').populate('replies.author');
      return res.status(403).render('note', {
        user,
        note,
        comments,
        error: 'Not authorized to delete this reply.'
      });
    }

    reply.remove();
    await comment.save();

    return res.redirect(`/notes/${comment.note._id}`);
  } catch (err) {
    console.error('Error deleting reply:', err.message);
    return res.status(500).render('note', {
      user: req.user || null,
      note: null,
      comments: [],
      error: 'Failed to delete reply.'
    });
  }
};