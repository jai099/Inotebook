const express = require('express')
const router = express.Router();
const { body, validationResult } = require('express-validator');
var fetchuser = require('../middleware/fetchuser');
const Note = require('../models/Notes')


// Route 1: Get all the notes using GET API
router.get('/fetchallnotes', fetchuser, async(req, res) => {
  try {
      const notes = await Note.find({ user: req.user.id })
    res.json(notes)
  } catch (error) {
      console.error(error.message)
      return res.status(500).send("Internal Server Error")
    
  }

})

// Route 2: Add a new note using POST API
router.post('/addnote', fetchuser, [
    body('title', 'Title cannot be empty').isLength({ min: 3 }),
    body('description', 'Description must be at least 5 chars long').isLength({ min: 5 }),
], async (req, res) => {
    try {
        
   
        const { title, description, tag } = req.body;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const note = new Note({
            title, description, tag, user: req.user.id
        })
        const savedNote = await note.save()
        res.json(savedNote)
    }
    catch (error) {
        console.error (error.message);
        return res.status(500).send("Internal Server Error")
    }
})

//Route 3: Update an existing note using PUT API
router.put('/updatenote/:id', fetchuser, async (req, res) => {
    const { title, description, tag } = req.body;
try {
    
   const newNote = {};
    if (title) { newNote.title = title };
    if (description) { newNote.description = description };
    if (tag) { newNote.tag = tag };
   
    //Find the note to be updated and update it
    let note = await Note.findById(req.params.id);
    if (!note) { 
        return res.status(404).send("Note not found")
    }
    if (note.user.toString() !== req.user.id) {
        return res.status(401).send("You can only update your own note")
    }
    note = await Note.findByIdAndUpdate(req.params.id, { $set: newNote }, { new: true });
    return res.json({ note });
} catch (error) {
     console.error (error.message);
        return res.status(500).send("Internal Server Error")
    
}
 
})

//Route 4 : Delete an existing note using DELETE API

router.delete('/deletenote/:id', fetchuser, async (req, res) => {
   
   try {
    
  
    //Find note to be deleted and delete it.

    let note = await Note.findById(req.params.id);
    if (!note) {
        return res.status(404).send("Note not found");
    
    }
    // Allow deletion of note only if user owns it
    if (note.user.toString() !== req.user.id) {
        return res.status(401).send("You can only delete your note");
    }
    note = await Note.findByIdAndDelete(req.params.id)
       res.json({ "Success": "Note has been deleted successfully" })
   } catch (error) {
        console.error (error.message);
        return res.status(500).send("Internal Server Error")
    
   } 
})

module.exports = router;