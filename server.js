const express = require('express');
require('dotenv').config();
const bankRoute = require('./routes/bankRoute');
const branchRoute = require('./routes/branchRoute');
const userRoute = require('./routes/userRoute');
const profileRoute = require('./routes/profileRoute');
const accountRoute = require('./routes/accountRoute');
const userAccountRoute = require('./routes/userAccountRoute');
const transactionRoute = require('./routes/transactionRoute');
const notificationRoute = require('./routes/notificationRoute');
const cardRoute = require('./routes/cardRoute');
const loanRoute = require('./routes/loanRoute');
const loanRepaymentRoute = require('./routes/loanRepaymentRoute');
const authRoute = require('./routes/authRoute');
const refreshRoute = require('./routes/refreshRoute');
const cookieParser = require('cookie-parser');
const healthRoute = require('./routes/healthRoute');

const db = require('./models'); // This includes sequelize and models

const app = express();
const PORT = process.env.PORT || 2000;

// Middleware to parse JSON bodies
app.use(express.json());

app.use(cookieParser())

const cors = require('cors');
app.use(cors({
  origin: 'http://localhost:2000', // your frontend URL
  credentials: true,
}));

//use routes
app.use('/api/v1/bank', bankRoute);
app.use('/api/v1/branch', branchRoute);
app.use('/api/v1/user', userRoute);
app.use('/api/v1/profile', profileRoute);
app.use('/api/v1/account', accountRoute);
app.use('/api/v1/joint', userAccountRoute);
app.use('/api/v1/transaction', transactionRoute);
app.use('/api/v1/notification', notificationRoute);
app.use('/api/v1/card', cardRoute);
app.use('/api/v1/loan', loanRoute);
app.use('/api/v1/repayment', loanRepaymentRoute);
app.use('/api/v1/auth', authRoute);
app.use('/api/v1/refresh', refreshRoute);
app.use('/api/v1/health', healthRoute);

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