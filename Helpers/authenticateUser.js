const { User, sequelize } = require('../models');
const bcrypt = require('bcryptjs');

console.log(Object.keys(db));
console.log(db.User);

const authenticateUser = async (email, password) => {
    console.log("================================");
    console.log("Searching for:", email);
    console.log("Table name:", User.getTableName());

    const count = await User.count();
    console.log("Total users:", count);

    const [tables] = await sequelize.query(`
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
    `);

    console.log("Tables:", tables);

    const users = await User.findAll({
        attributes: ['id', 'email'],
        limit: 10
    });

    console.log("Users found:", users);

    const user = await User.findOne({
        where: { email }
    });

    console.log("Matched user:", user);

    if (!user) {
        throw new Error("User not found");
    }

    return user;
};

module.exports = authenticateUser;