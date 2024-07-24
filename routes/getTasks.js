const express = require('express');
const router = express.Router();
const { GetTasks,getWeeklyTasks,getMonthlyTasks,getsubtasks } = require('../controller/getTasks');

router.get('/', GetTasks);

router.get('/getsubtasks', getsubtasks);

router.get('/getWeeklyTasks', getWeeklyTasks);
router.get('/getMonthlyTasks', getMonthlyTasks);




module.exports = router;
