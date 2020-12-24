const mongoose = require('mongoose');

const schemaPayment = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    user_id: { type: String, required: true },
    username: { type: String, required: true },
    email: { type: String, required: true },
    numberphone: { type: String, required: true },
    address: { type: Object, required: true },
    cart: { type: Array, default: [] },
    status: { type: Boolean, default: false }
}, {
    timestamps: true
});

module.exports = mongoose.model('Payment', schemaPayment);