const mongoose = require('mongoose');

const schemaProduct = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    Name: { type: String, trim: true, required: true },
    Image: { type: Object, required: true },
    Price: { type: Number, trim: true, required: true },
    Sale: { type: Number, trim: true, default: 0 },
    Information: { type: Object, required: true },
    Details: { type: String, trim: true, required: true },
    Category: { type: String, trim: true, required: true },
    Producer: { type: String, trim: true, required: true },
    Warranties: { type: Number, trim: true, required: true },
    Sold: { type: Number, default: 0 },
    Checked: { type: Boolean, default: false },
    Hots: { type: Boolean, default: false },
    News: { type: Boolean, default: false },
}, {
    timestamps: true
});

module.exports = mongoose.model('Product', schemaProduct);