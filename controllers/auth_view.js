const authenticateUser = require('../Helpers/authenticateUser');
const generateToken = require('../Helpers/generateToken');
require('dotenv').config();

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await authenticateUser(email, password);

        const { token, refreshToken } = generateToken(user);

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'None',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        res.status(200).json({
            user,
            token,
            message: 'Login successful',
        });
    } catch (err) {
        console.error(err);

        res.status(500).json({
            message: err.message,
        });
    }
};

exports.getCurrentUser = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};