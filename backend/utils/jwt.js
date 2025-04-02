// src/utils/jwt.js
const jwt = require('jsonwebtoken');

// Generate JWT token
const generateToken = (user) => {
    return jwt.sign(
        {
            id: user._id,
            email: user.email,
            role: user.role
        },
        process.env.JWT_SECRET || 'default-secret-key', // Fallback for development
        {
            expiresIn: process.env.JWT_EXPIRES_IN || '1d' // Default 1 day expiration
        }
    );
};

// Verify JWT token
const verifyToken = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_SECRET || 'default-secret-key');
    } catch (error) {
        console.error('JWT Verification Error:', error.message);
        return null; // Return null if verification fails
    }
};

module.exports = {
    generateToken,
    verifyToken
};