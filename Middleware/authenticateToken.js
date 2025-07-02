require('dotenv').config(); // Must be at the very top
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader?.startsWith('Bearer ')) {
        return res.sendStatus(401);
    }

    const token = authHeader.split(' ')[1];
    
    jwt.verify(
        token,
        process.env.JWT_SECRET, // Changed to match your .env
        (err, decoded) => {
            if (err) {
                console.error('JWT Error:', err.message);
                return res.sendStatus(403);
            }

            req.user = decoded;
            req.roles = decoded.roles || [];
            next();
        }
    );
};