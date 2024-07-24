const express = require('express');
const router = express.Router();
const { updateDetails } = require('../controller/updateDetails');
const multer = require("multer");
const storageConfig = require("../utils/multer");

const upload = multer({ storage: storageConfig.storage });


router.post('/', upload.single('image') , updateDetails);

module.exports = router;
