const express = require('express');
const router = express.Router();
const { AddTask,AddSubTask, checkgoogle } = require('../controller/addtask');

router.post('/', AddTask);
router.post('/addsubtask', AddSubTask);



router.get('/checkgoogle',checkgoogle)

// router.get('/oauth2callback', generateCallback);
module.exports = router;
