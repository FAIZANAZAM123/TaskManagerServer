const express = require('express');
const router = express.Router();
const notesController= require('../controller/notes');

router.post('/addnote', notesController.addnote);


router.get('/getallnotes', notesController.getallnotes);

module.exports = router;
