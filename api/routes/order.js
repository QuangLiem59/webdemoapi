const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const Order = require('../Models/Order');
const Product = require('../Models/Product');

const checkAuth = require('../Middleware/check-auth');
const orderController = require('../Controller/order');

router.get('/', orderController.order_get_all);

router.get('/:orderId', checkAuth, orderController.order_get_by_id);

router.post('/', checkAuth, orderController.order_add_order);

// router.patch('/:productId', (req, res, next) => {
//     const id = req.params.productId;
//     const updateOps = {};
//     for (const ops of req.body) {
//         updateOps[ops.propName] = ops.value;
//     }
//     Product.updateOne({ _id: id }, { $set: updateOps })
//         .exec()
//         .then(result => {
//             res.status(200).json({
//                 message: 'Product Updated!',
//                 product: result,
//                 request: {
//                     type: 'GET',
//                     url: 'http://localhost:2228/product/' + id,
//                 }
//             });
//         })
//         .catch(err => {
//             console.log(err);
//             res.status(500).json({
//                 error: err
//             })
//         })
// })

router.delete('/:orderId', checkAuth, orderController.order_delete_order);

module.exports = router;