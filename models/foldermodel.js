const mongoose =require('mongoose');

const folderSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true
    },
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },

    sharedWith:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    }


},{timestamps:true});

const Folder =mongoose.model('Folder',folderSchema);
module.export=Folder;


  