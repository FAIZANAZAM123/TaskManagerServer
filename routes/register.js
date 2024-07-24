const express = require('express');
const router = express.Router();
const { Register ,verifyemail} = require('../controller/register');
const multer = require("multer");
const storageConfig = require("../utils/multer");

const upload = multer({ storage: storageConfig.storage });


router.post('/', upload.single('image') , Register);

router.get('/verify-email', verifyemail);



module.exports = router;
