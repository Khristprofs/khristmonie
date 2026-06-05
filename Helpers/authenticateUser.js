const { User, sequelize } = require('../models');
const bcrypt = require('bcryptjs');

const authenticateUser = async (email, password) => {

    const user = await User.findOne({
        where: { email }
    });

    if (!user) {
        throw new Error('User not found');
    }

    const isMatch = await bcrypt.compare(
        password,
        user.password
    );

    if (!isMatch) {
        throw new Error('Invalid credentials');
    }

    const tables = await sequelize.query(
        `SELECT table_name
   FROM information_schema.tables
   WHERE table_schema = 'public'`
    );

    return {
        _id: user.id,
        firstname: user.firstname,
        middlename: user.middlename,
        lastname: user.lastname,
        email: user.email,
        phone: user.phone,
        nin: user.nin,
        role: user.role,
    };
};

module.exports = authenticateUser;