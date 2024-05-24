const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Admin = require('../models/admin');
const auth = require('../middleware/auth');

const router = express.Router();

// Admin registration route (run once to create the admin)
router.post('/register', async (req, res) => {
    const { username, password } = req.body;
    try {
        let admin = await Admin.findOne({ username });
        if (admin) {
            return res.status(400).json({ msg: 'Admin already exists' });
        }

        admin = new Admin({ username, password });

        const salt = await bcrypt.genSalt(10);
        admin.password = await bcrypt.hash(password, salt);
        
        await admin.save();

        const payload = { admin: { id: admin.id } };

        jwt.sign(payload, 'yourSecretKey', { expiresIn: 3600 }, (err, token) => {
            if (err) throw err;
            res.json({ token });
        });
    } catch (err) {
        res.status(500).send('Server error');
    }
});

// Admin login route
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const admin = await Admin.findOne({ username });
        if (!admin) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        const payload = { admin: { id: admin.id } };

        jwt.sign(payload, 'yourSecretKey', { expiresIn: 3600 }, (err, token) => {
            if (err) throw err;
            res.json({ token });
        });
    } catch (err) {
        res.status(500).send('Server error');
    }
});

module.exports = router;
