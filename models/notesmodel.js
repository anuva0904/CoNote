const { Timestamp } = require('mongodb');
const mongoose =require('mongoose');

const notesSchema=new mongoose.Schema({
    title:{
        type:String,
        required:true
    },
    content:{
        type:String,
        required:true
    },
    folder:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Folder',
        required:true
    },
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },

    collaborators:{
        type:[mongoose.Schema.Types.ObjectId],
        ref:'User',
        default:[]
    },

    lastEditedBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },

    tags:{
        type:[String],
        default:[]
    },

 },{timestamps:true});

const Notes = mongoose.model('Notes',notesSchema);
module.exports=Notes;