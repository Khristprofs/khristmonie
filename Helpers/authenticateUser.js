const User = require('../models/User');
const bcrypt = require('bcryptjs');

const authenticateUser = async (email, password) => {
    try {
        const user = await User.findOne({ where: { email } });
        
        if (!user) {
            throw new Error('User not found');
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            throw new Error('Invalid credentials');
        }

        // Return plain object instead of Sequelize model instance
        return {
            _id: user.id,
            firstname: user.firstname,
            middlename: user.middlename,
            lastname: user.lastname,
            email: user.email,
            phone: user.phone,
            nin: user.nin,
            role: user.role
            // Don't return password!
        };

    } catch (err) {
        console.error('Authentication error:', err);
        throw err;
    }
};

module.exports = authenticateUser;