const express = require('express');
const Discussion = require('../models/Discussion');
const auth = require('../middleware/auth');
const router = express.Router();

// Create a discussion post
router.post('/', auth, async (req, res) => {
    const { topic, content } = req.body;
    try {
        const discussion = new Discussion({
            topic,
            content,
            user: req.user.id,
        });
        await discussion.save();
        res.json(discussion);
    } catch (err) {
        res.status(500).send('Server error');
    }
});

// Get all discussions
router.get('/', async (req, res) => {
    try {
        const discussions = await Discussion.find().populate('user', 'name');
        res.json(discussions);
    } catch (err) {
        res.status(500).send('Server error');
    }
});

module.exports = router;
