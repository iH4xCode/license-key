// key-server.js
const express = require('express');
const crypto = require('crypto');
const app = express();
require('dotenv').config();

// Middleware
app.use(express.json());

// Authentication middleware
const authenticateRequest = (req, res, next) => {
    const clientToken = req.headers['x-auth-token'];
    if (clientToken === process.env.API_TOKEN) {
        next();
    } else {
        res.status(403).send('Access denied');
    }
};

// Key endpoint
app.get('/get-key', authenticateRequest, (req, res) => {
    try {
        // Time-based key component (changes hourly)
        const timeComponent = Math.floor(Date.now() / (1000 * 60 * 60));
        
        // Generate dynamic key
        const dynamicKey = crypto.createHmac('sha256', process.env.SECRET_KEY)
            .update(timeComponent.toString())
            .digest('hex')
            .substring(0, 16); // Get first 16 chars
        
        res.json({
            key: dynamicKey,
            expiresAt: new Date(Date.now() + 3600000).toISOString() // 1 hour expiration
        });
    } catch (error) {
        console.error("Key generation error:", error);
        res.status(500).send("Internal server error");
    }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Key server running on port ${PORT}`);
});