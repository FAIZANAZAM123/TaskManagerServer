const express = require('express');
const router = express.Router();
const InvitationController= require('../controller/invitationtask');

router.post('/addinvitation', InvitationController.addinvitation);

router.post('/acceptask', InvitationController.acceptask);


router.get('/getinvitedtasks', InvitationController.getinvitedtasks);

module.exports = router;
