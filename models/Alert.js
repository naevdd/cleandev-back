const mongoose = require('mongoose');

const AlertSchema = new mongoose.Schema({
    image: { type: String, required: true },
    location: { type: String, required: true },
    phone: { type: String, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Alert', AlertSchema);
