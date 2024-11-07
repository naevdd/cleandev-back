const mongoose = require('mongoose');

const DiscussionSchema = new mongoose.Schema({
    topic: { type: String, required: true },
    content: { type: String, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Discussion', DiscussionSchema);
