const express = require('express');
const router = express.Router();
const commentController= require('../controller/comments');

router.post('/addcomment', commentController.addcomment);

module.exports = router;
