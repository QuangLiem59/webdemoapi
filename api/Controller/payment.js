const mongoose = require('mongoose');
const Payment = require('../Models/Payment');
const Product = require('../Models/Product');
const User = require('../Models/User');

const paymentController = {
    getPayment: async (req, res) => {
        try {
            const payment = await Payment.find({ user_id: req.userData.userId });
            return res.json(payment);
        } catch (err) {
            return res.status(500).json({ message: err.message });
        }
    },
    createPayment: async (req, res) => {
        try {
            const user = await User.findById(req.userData.userId).select('username email');
            if (!user) return res.status(400).json({ message: "User does not exist!" });

            const { cart, address, numberphone } = req.body;
            const { username, email, _id } = user;

            const newPayment = new Payment({
                _id: new mongoose.Types.ObjectId(),
                user_id: _id,
                username,
                email,
                cart,
                address,
                numberphone
            })
            cart.filter(item => {
                return sold(item._id, item.quantity, item.sold);
            })
            await newPayment.save();
            res.json(newPayment);

        } catch (err) {
            return res.status(500).json({ message: err.message });
        }
    }
}

const sold = async (id, quantity, oldsold) => {
    await Product.findOneAndUpdate({ _id: id }, {
        sold: quantity + oldsold
    })
}

module.exports = paymentController;