const express = require('express')
const router = express.Router()

const messageController = require('../controllers/messagecontroller')

router.get('/', messageController.getMessages);
router.get('/new', messageController.getNewMessageForm);

router.post('/submit', messageController.postNewMessage)
router.get('/message/:id', messageController.getMessageDetails);

module.exports = router;