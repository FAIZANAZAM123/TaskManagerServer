const express = require('express');
const router = express.Router();
const { ChangeStatus,changesubtaskstatus } = require('../controller/changeStatus');

router.get('/', ChangeStatus);
router.get('/changesubtaskstatus', changesubtaskstatus);

module.exports = router;
