const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

router.post('/create', (req, res) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(401).json({ message: 'No token provided' });

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) return res.status(401).json({ message: 'Invalid token' });
        // Dummy course creation
        res.json({ message: 'Course created', user: decoded.email });
    });
});

router.get('/list', (req, res) => {
    res.json({ courses: ['Course1', 'Course2', 'Course3'] });
});

module.exports = router;
