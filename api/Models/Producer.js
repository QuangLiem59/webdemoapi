const mongoose = require('mongoose');

const schemaProducer = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    ProducerName: { type: String, required: true },
    ProducerIcon: { type: String, required: true }
});

module.exports = mongoose.model('Producer', schemaProducer);