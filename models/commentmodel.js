const mongoose =require('mongoose');

const replySchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});
const commentSchema =new mongoose.Schema({
    commentText:{
        type:String,
        required:true
    },
    note:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Note',
        required:true
    },
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
     replies: [replySchema] // array of nested reply objects
}, { timestamps: true });

module.exports = mongoose.model('Comment', commentSchema);