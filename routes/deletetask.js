const express = require('express');
const router = express.Router();
const { DeleteTask ,deletesubtask} = require('../controller/deleteTask');

router.get('/', DeleteTask);
router.get('/deletesubtask', deletesubtask);

module.exports = router;
