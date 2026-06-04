const { User, sequelize } = require('../models');
const bcrypt = require('bcryptjs');

const authenticateUser = async (email, password) => {
    const [dbInfo] = await sequelize.query(`
        SELECT current_database() AS db,
               current_user AS user
    `);

    console.log("DB INFO:", dbInfo);

    const [countResult] = await sequelize.query(`
        SELECT COUNT(*) FROM users
    `);

    console.log("RAW SQL COUNT:", countResult);

    console.log("ORM COUNT:", await User.count());

    const user = await User.findOne({
        where: { email }
    });

    console.log("FOUND USER:", user);

    if (!user) {
        throw new Error("User not found");
    }

    return user;
};

module.exports = authenticateUser;