const mongoose = require('mongoose');
const Order = require('../Models/Order');
const Product = require('../Models/Product');

exports.order_get_all = (req, res, next) => {
    Order.find()
        .select('-__v')
        .populate('product', 'Name')
        .exec()
        .then(result => {
            const response = {
                count: result.length,
                order: result.map(docs => {
                    return {
                        _id: docs._id,
                        product: docs.product,
                        quantity: docs.quantity,
                        request: {
                            type: 'GET',
                            url: 'http://localhost:2228/order/' + docs._id,
                        }
                    }
                })
            }
            if (result.length > 0) {
                res.status(200).json(response);
            } else {
                res.status(404).json({
                    message: "Nothing"
                })
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: err });
        })
};

exports.order_get_by_id = (req, res, next) => {
    const id = req.params.orderId;
    Order.findById(id)
        .select('-__v')
        .populate('product', '-__v')
        .exec()
        .then(docs => {
            if (docs) {
                res.status(200).json({
                    order: docs,
                    request: {
                        type: 'GET',
                        url: 'http://localhost:2228/order'
                    }
                });
            } else {
                res.status(404).json({
                    message: "Order not found"
                })
            }

        })
        .catch(err => {
            console.log(err)
            res.status(500).json({ error: err });
        });
}

exports.order_add_order = (req, res, next) => {
    Product.findById(req.body.productId)
        .then(product => {
            if (!product) {
                return res.status(404).json({
                    message: 'Product not found'
                });
            }
            const order = new Order({
                _id: new mongoose.Types.ObjectId(),
                quantity: req.body.quantity,
                product: req.body.productId
            });
            return order.save()

        })
        .then(result => {
            res.status(201).json({
                message: "Add Order Complete !",
                createdOrder: {
                    _id: result._id,
                    quantity: result.quantity,
                    product: result.product
                },
                request: {
                    type: 'GET',
                    url: 'http://localhost:2228/order/' + result._id,
                }
            })
        }).catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        })
}

exports.order_delete_order = (req, res, next) => {
    const id = req.params.orderId;
    Order.deleteOne({ _id: id })
        .exec()
        .then(result => {
            res.status(200).json({
                message: "Order Removed!",
                order: result,
                request: {
                    type: 'POST',
                    url: 'http://localhost:2228/order'
                }
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            })
        })
}