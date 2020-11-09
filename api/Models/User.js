const mongoose = require('mongoose');

const schemaUser = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    email: {
        type: String,
        required: true,
        unique: true,
        match: /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/
    },
    username: { type: String, required: true, trim: true },
    password: { type: String, required: true },
    role: { type: Number, default: 0 },
    cart: { type: Array, default: [] }
}, {
    timestamps: true
});

module.exports = mongoose.model('User', schemaUser);