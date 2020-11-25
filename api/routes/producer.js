const express = require('express');
const router = express.Router();

const checkAuth = require('../Middleware/check-auth');

const producerController = require('../Controller/producer');

router.get('/', producerController.producer_get_all);

router.post('/', producerController.producer_add_producer);


module.exports = router;