const authenticateUser = require('../Helpers/authenticateUser');
const generateToken = require('../Helpers/generateToken');
require('dotenv').config();

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate user
        const user = await authenticateUser(email, password);

        // Generate tokens
        const { token, refreshToken } = generateToken(user);

        // Set refresh token in cookie (optional but recommended)
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'None',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        // Respond with token and user data
        res.status(200).json({
            user,
            token, // ✅ using `token` (not `accessToken`) to match frontend
            message: 'Login successful',
        });
    } catch (err) {
        console.error("LOGIN ERROR");
        console.error(err);

        return res.status(500).json({
            message: err.message,
            stack: err.stack
        });
    }
};
