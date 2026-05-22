require('dotenv').config();

module.exports = {
  development: {
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'khristmonie',
    host: process.env.DB_HOST || '127.0.0.1',
    dialect: 'postgres',
    logging: false
  },

  test: {
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'khristmonie_test',
    host: process.env.DB_HOST || '127.0.0.1',
    dialect: 'postgres',
    logging: false
  },

  production: {
    use_env_variable: 'DATABASE_URL',
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    },
    logging: false
  }
};