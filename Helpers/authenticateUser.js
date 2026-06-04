const { User } = require('../models');
const bcrypt = require('bcryptjs');
const db = require('../models');

console.log(Object.keys(db));
console.log(db.User);

const authenticateUser = async (email, password) => {
    console.log('User table:', User.getTableName());
    console.log("Searching email:", email);
    console.log("Table:", User.getTableName());
    const user = await User.findOne({
        where: { email }
    });
    console.log("Found:", user);

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
    console.log("Table Name:", User.getTableName());

    const tables = await sequelize.query(
        `SELECT table_name
   FROM information_schema.tables
   WHERE table_schema = 'public'`
    );

    console.log("Tables:", tables[0]);

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