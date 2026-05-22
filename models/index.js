const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');

const basename = path.basename(__filename);

const env = process.env.NODE_ENV || 'development';

console.log('NODE_ENV:', env);

const config = require(__dirname + '/../config/config.js')[env];

console.log('CONFIG:', config);

console.log(
  'DATABASE_URL EXISTS:',
  !!process.env.DATABASE_URL
);

console.log(
  'DATABASE_URL VALUE:',
  process.env.DATABASE_URL
);

const db = {};

let sequelize;

if (config.use_env_variable) {
  sequelize = new Sequelize(
    process.env[config.use_env_variable],
    config
  );
} else {
  sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,
    config
  );
}