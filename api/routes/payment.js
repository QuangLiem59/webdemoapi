const express = require('express');
const router = express.Router();
const checkAuth = require('../Middleware/check-auth');
const paymentController = require('../Controller/payment');

router.get('/', checkAuth, paymentController.getPayment);

router.post('/payment', checkAuth, paymentController.createPayment);

module.exports = router;