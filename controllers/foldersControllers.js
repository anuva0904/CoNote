const Folder = require('../models/foldermodel');
const Notes =require('../models/notesmodel');

//Get folder
exports.getFolder=async(req,res)=>{
    try{
        const user =req.user;
        if (!user) {
            return res.status(401).redirect('/login');
        }
        const folders = await Folder.find({owner : user._id}).sort({createdAt: -1});
        return res.status(200).render('folders',{
            user,
            folders
        });
    }catch(err){
        console.error('Error Fetching Folders', err.message);
        return res.status(500).render('folders', { user: req.user || null,error: 'Failed to load folders.'});
    }
    
}
//Get a specific folder
exports.getFolderById=async(req,res)=>{
    try{
        const user =req.user;
        const folderId = req.params.id;

        if (!user) {
            return res.status(401).redirect('/login');
        }

        const folder = await Folder.findOne({ _id: folderId, owner: user._id });
        if (!folder) {
        return res.status(404).render('folders', { 
            user, 
            error: 'Folder not found or access denied.' 
        });
        }


        const notes = await Notes.find({folder: folderId, owner : user._id}).sort({updatedAt:-1});
        return res.status(200).render('notes',{
            user, notes , folder
        });

    }catch(err){
        console.error('Error Fetching Notes', err.message);
        res.status(500).render('folders', {owner:req.user|| null, error:'Failed to load Notes.'});
    }
    
}


// Create a folder
exports.createFolder=async(req,res)=>{
    try{
        const user= req.user;

        if(!user){
            return res.status(401).redirect('/login');
        }
        const {name} = req.body;

        if (!name || name.trim() === '') {
        return res.status(400).render('folders', { 
            user, 
            error: 'Folder name is required.' 
        });
        }

        const newfolder = await new Folder({
            name,
            owner : user._id,
            sharedWith : []
        })

        await newfolder.save();
        return res.status(201).redirect('/folders');
    }catch(err){
        console.error('Error Creating the folder.', err.message);
        return res.status(500).render('folders', {user:req.user || null , 
        error: 'Failed to create folder. Please try again later.'});
    }
    
}


//Rename a Folder
exports.updateFolder=async (req,res)=>{
    try{
        const user =req.user;
        if(!user){
            return res.status(401).redirect('/login');
        }

        const {name} =req.body;

        if (!name || name.trim() === '') {
        return res.status(400).render('folders', {
            user,
            error: 'Folder name cannot be empty.',
        });
        }

        const folderId = req.params.id ;
        const newname =await Folder.findOneAndUpdate({_id : folderId , owner : user._id}, {name: name.trim()},
        {new: true, runValidators: true});

        if (!newname) {
        return res.status(404).render('folders', {
            user,
            error: 'Folder not found or access denied.',
        });
        }


        return res.status(200).redirect('/folders');
    }catch(err){
        console.error('Error updating Folder Name.', err.message);
        return res.status(500).render('folders', { user : req.user || null , error : 'Failed to update the folder name.'});
    }
    
}


//Delete a folder
exports.deleteFolder=async(req,res)=>{

    try{
        const user=req.user;
        if(!user){
            return res.status(401).redirect('/login');
        }

        const folderId =req.params.id;
        const folder = await Folder.findOne({_id: folderId, owner: user._id});
        if(!folder){
            return res.status(404).render('folders', {
            user,
            error: 'Folder not found or access denied.',
        });
        }
        await Notes.deleteMany({ folder: folderId,owner: user._id,})
        await Folder.findByIdAndDelete(folderId);
        
        return res.redirect('/folders')
    }


    catch(err){
        console.error('Error deleting folder', err.message);
        return res.status(500).render('folders', {user: req.user || null, error:'Unable to delete Folder'});
    }
}


