const express = require('express');
const multer = require('multer');
const Alert = require('../models/Alert');
const auth = require('../middleware/auth');
const router = express.Router();

// Multer configuration for image upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage });

// Post an alert
router.post('/', auth, upload.single('image'), async (req, res) => {
    const { location, phone } = req.body;
    try {
        const alert = new Alert({
            image: req.file.path,
            location,
            phone,
            user: req.user.id,
        });
        await alert.save();
        res.json(alert);
    } catch (err) {
        res.status(500).send('Server error');
    }
});

module.exports = router;
