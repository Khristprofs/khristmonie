require('dotenv').config();

module.exports = {
  development: {
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'Prof.khrist@0602',
    database: process.env.DB_NAME || 'khristmonie',
    host: process.env.DB_HOST || '127.0.0.1',
    dialect: 'postgres',
  },
  // Add test and production environments as needed
  logging: false // Disables SQL query logging
};