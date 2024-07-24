const express = require('express');
const router = express.Router();
const { UpdateTask, managetask,updatesubtask,updateorder } = require('../controller/updatetask');

router.get('/', UpdateTask);

router.get('/updatesubtask', updatesubtask);

router.get('/managetask', managetask);

router.post('/updateorder', updateorder);



module.exports = router;
