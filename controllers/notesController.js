const Notes =require('../models/notesmodel');
const Folder = require('../models/foldermodel');

//Get all notes
exports.getNotes = async(req,res)=>{
    try{
        const user = req.user;
        const { search, tag } = req.query;
        if(!user){
            return res.status(401).redirect('/login');
        }
        const owner={ owner: user._id};
        if (tag && tag.trim() !== '') {
        owner.tags = { $regex: tag.trim(), $options: 'i' };
    }
        if(search){
            owner.$or = [
            { title: { $regex: search, $options: 'i' } },
            { content: { $regex: search, $options: 'i' } },
            ];
        }
        const notes =await Notes.find(owner).sort({updatedAt: -1 }).populate('folder');
        return res.status(200).render('notes', {user, notes , search , tag});
    }catch(err){
        console.error('Error Fetching Notes', err.message);
        return res.status(500).render('notes', { user: req.user || null, error: 'Failed to load notes.' });
    }
}

// Get notes by specific id's
exports.getNoteById = async(req,res)=>{
    try{
        const user =req.user;
        if(!user){
            return res.status(401).redirect('/login');
        }

        const notesId = req.params.id;
        const note = await Notes.findOne({_id: notesId, owner: user._id}).populate('folder');
        if(!note){
            return res.status(404).render('note', { user,
    note: null,error:'Note not found or access denied.'});
        }

        return res.status(200).render('note', {note, user, error: null});
    }catch(err){
        console.error('Error fetching notes.',err.message);
        return res.status(500).render('notes',{user: req.user || null, error:'Failed to fetch the note.'});
    }

}

//Create a new note
exports.createNote = async(req,res)=>{
    try{
        const user =req.user;
        if(!user){
            return res.status(401).redirect('/login');
        }

        const {title, content, tags }= req.body;
        const { folderId } = req.params;
        if(!title || title.trim()===''){
            return res.status(400).render('notes', { 
            user, 
            error: 'Title is required.' 
        });
        }

        if(!content || content.trim()===''){
            return res.status(400).render('notes', { 
            user, 
            error: 'Content is required.' 
        });
        }

        const folder = await Folder.findOne({ _id: folderId, owner: user._id });
        if (!folder) {
        return res.status(404).render('notes', { user, error: 'Folder not found or access denied.' });
        }


        const newNote =  new Notes ({
            title: title.trim(),
            content: content.trim(),
            folder: folder._id,
            owner: user._id,
            collaborators:[],
            tags:Array.isArray(tags)
        ? tags.map(t => t.trim())
        : (tags ? [tags.trim()] : []) 
        });

        await newNote.save();
        return res.status(200).redirect(`/folders/${folder._id}`);

    }catch(err){
        console.error('Error creating note',err.message);
        return res.status(500).render('notes',{user: req.user || null, error:'Failed to create a new note.'});
    }

}

//Duplicate Note
exports.duplicateNote = async(req,res)=>{
    try{
        const user =req.user;
        if(!user){
            return res.status(401).redirect('/login');
        }

        const {id}= req.params;

        const note = await Notes.findOne({_id: id, owner: user._id});
        if(!note){
            return res.status(404).render('note', {user, note: null,error:'Note not found or access denied.'});
        }

        const newNote = new Notes({
        title: `${note.title} (Copy)`,
        content: note.content,
        folder: note.folder,
        owner: user._id,
        collaborators: [...note.collaborators],
        tags: [...note.tags],
    });


        await newNote.save();
        return res.status(200).redirect(`/folders/${note.folder}`);
    }catch(err){
        console.error('Error, unable to create duplicates.',err.message);
        return res.status(500).render('notes',{user:req.user || null , error:'Failed to create duplicate notes.'});
    }

}

//Update Notes
exports.updateNote = async(req,res)=>{
    try{
        const user =req.user;
        if(!user){
            return res.status(401).redirect('/login');
        }
        const {title, content , tags} = req.body;
        const {id}=req.params;
        const note = await Notes.findOne({_id:id, owner:user._id});
        if(!note){
            return res.status(404).render('note', {user, note: null,error:'Note not found or access denied.'});
        }

         if(!title || title.trim()===''){
            return res.status(400).render('note', { 
            user, 
            note: null,
            error: 'Title is required.' 
        });
        }

        if(!content || content.trim()===''){
            return res.status(400).render('note', { 
            user, 
            note: null,
            error: 'Content is required.' 
        });
        }

        const updatedData = {
            title: title.trim(),
            content: content.trim(),
            tags: Array.isArray(tags)
                ? tags.map(t => t.trim())
                : (tags ? [tags.trim()] : [])
        };
        const updatedNote = await Notes.findOneAndUpdate({_id:note._id,owner: user._id },  updatedData,
            { new: true, runValidators: true });

        return res.status(200).redirect(`/folders/${updatedNote.folder}`);

    }catch(err){
        console.error('Error updating notes',err.message);
        return res.status(500).render('note', {
            user: req.user || null,
            note: null,
            error: 'Failed to update the note.'
        });
    }

}

//Delete a note
exports.deleteNote = async(req,res)=>{
    try{
        const user = req.user;
    if (!user) {
      return res.status(401).redirect('/login');
    }

    const { id } = req.params;

    // Find and delete note belonging to this user
    const deletedNote = await Notes.findOneAndDelete({
      _id: id,
      owner: user._id
    });

    if (!deletedNote) {
      return res.status(404).render('note', {
        user,
        note:null,
        error: 'Note not found or access denied.'
      });
    }

    // Redirect back to the folder where the note was
    return res.status(200).redirect(deletedNote.folder ? `/folders/${deletedNote.folder}` : '/notes');

    }catch(err){
        console.error('Error Deleting Note',err.message);
        return res.status(500).render('note', {
            user: req.user || null,
            note: null,
            error: 'Failed to delete the note.'
        });
    }

}

//autosave
exports.autoSaveNote = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { id } = req.params;
    const { title, content, tags } = req.body;

    const updateData = {};
    if (title !== undefined) updateData.title = title.trim();
    if (content !== undefined) updateData.content = content.trim();
    if (tags !== undefined) {
      updateData.tags = Array.isArray(tags)
        ? tags.map(t => t.trim())
        : tags ? [tags.trim()] : [];
    }

    const note = await Notes.findOneAndUpdate(
      { _id: id, owner: user._id },
      updateData,
      { new: true }
    );

    if (!note) {
      return res.status(404).json({ success: false, message: 'Note not found' });
    }

    return res.json({
      success: true,
      note,
      message: 'Auto-saved successfully',
      lastSavedAt: new Date().toISOString()
    });
  } catch (err) {
    console.error('Error auto-saving note', err.message);
    return res.status(500).json({ success: false, message: 'Failed to auto-save note' });
  }
};