const express = require('express');
const router = express.Router();
const { GetPositions } = require('../controller/getPositions');

router.get('/', GetPositions);

module.exports = router;
