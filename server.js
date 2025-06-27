const express = require('express');
require('dotenv').config();
const bankRoute = require('./routes/bankRoute');
const branchRoute = require('./routes/branchRoute');
const userRoute = require('./routes/userRoute');
const profileRoute = require('./routes/profileRoute');
const accountRoute = require('./routes/accountRoute');
const userAccountRoute = require('./routes/userAccountRoute');
const transactionRoute = require('./routes/transactionRoute');

const db = require('./models'); // This includes sequelize and models

const app = express();
const PORT = process.env.PORT || 2000;

// Middleware to parse JSON bodies
app.use(express.json());

//use routes
app.use('/api/v1/bank', bankRoute);
app.use('/api/v1/branch', branchRoute);
app.use('/api/v1/user', userRoute);
app.use('/api/v1/profile', profileRoute);
app.use('/api/v1/account', accountRoute);
app.use('/api/v1/joint', userAccountRoute);
app.use('/api/v1/transaction', transactionRoute);

// Test DB connection
db.sequelize.authenticate()
  .then(() => {
    console.log('✅ PostgreSQL connected successfully.');
  })
  .catch((err) => {
    console.error('❌ Error connecting to the database:', err);
  });

// Sync all models
db.sequelize.sync({ force: true }) // Set to true only for development
  .then(() => {
    console.log('✅ Database & tables synced!');
    app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ Error syncing database:', err);
  });