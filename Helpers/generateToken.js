const jwt = require('jsonwebtoken');
require('dotenv').config();

// Debug: Verify secrets are loading
console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);
console.log('JWT_REFRESH_SECRET exists:', !!process.env.JWT_REFRESH_SECRET);

const getAuthToken = (user) => {
    if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET is not configured');
    }
    return jwt.sign(
        { id: user._id, roles: [user.role] },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
    );
}

const genRefreshToken = (user) => {
    if (!process.env.JWT_REFRESH_SECRET) {
        throw new Error('JWT_REFRESH_SECRET is not configured');
    }
    return jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: '7d' }
    );
}

const generateToken = (user) => {
    try {
        const token = getAuthToken(user);
        const refreshToken = genRefreshToken(user);
        return { token, refreshToken };
    } catch (error) {
        console.error('Token generation failed:', error.message);
        throw error; // Re-throw for controller to handle
    }
}

module.exports = generateToken;