const User = require('../models/User');
const authenticateUser = require('../Helpers/authenticateUser');
const generateToken = require('../Helpers/generateToken');
require('dotenv').config(); // Add this at top

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Authenticate and get user data
        const user = await authenticateUser(email, password);
        
        // Generate tokens
        const { token, refreshToken } = generateToken(user);

        // Set cookie
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'None',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        // Return response with user data
        return res.status(200).json({
            user, // Now contains all user fields except password
            message: "Login successful",
            accessToken: token
        });

    } catch (err) {
        console.error('Login error:', err);
        
        const status = err.message.includes('credentials') ? 401 : 500;
        res.status(status).json({ 
            message: err.message || 'Login failed' 
        });
    }
}